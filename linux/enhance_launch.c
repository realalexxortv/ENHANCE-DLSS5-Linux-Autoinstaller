/* No-FUSE launcher. The executable is this program plus a tar.xz payload
   and a 16-byte footer: little-endian payload offset, then "ENHANCE1". */
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>

static const char MAGIC[8] = {'E', 'N', 'H', 'A', 'N', 'C', 'E', '1'};

static void show_error(const char *msg) {
    fprintf(stderr, "ENHANCE: %s\n", msg);
    if (!getenv("DISPLAY") && !getenv("WAYLAND_DISPLAY")) return;
    pid_t pid = fork();
    if (pid == 0) {
        execlp("kdialog", "kdialog", "--error", msg, (char *)NULL);
        execlp("zenity", "zenity", "--error", "--width", "460", "--text", msg, (char *)NULL);
        execlp("notify-send", "notify-send", "ENHANCE", msg, (char *)NULL);
        _exit(1);
    }
    if (pid > 0) {
        int status = 0;
        waitpid(pid, &status, 0);
    }
}

static char *self_path(void) {
    char buf[4096];
    ssize_t n = readlink("/proc/self/exe", buf, sizeof buf - 1);
    if (n < 0) return NULL;
    buf[n] = 0;
    return strdup(buf);
}

static int mkdir_p(const char *path) {
    char tmp[1024];
    size_t len = strlen(path);
    if (len == 0 || len >= sizeof tmp) return -1;
    memcpy(tmp, path, len + 1);
    for (size_t i = 1; i < len; i++) {
        if (tmp[i] != '/') continue;
        tmp[i] = 0;
        if (mkdir(tmp, 0755) != 0 && errno != EEXIST) return -1;
        tmp[i] = '/';
    }
    if (mkdir(tmp, 0755) != 0 && errno != EEXIST) return -1;
    return 0;
}

static int read_footer(const char *path, uint64_t *off) {
    struct stat st;
    if (stat(path, &st) != 0 || st.st_size < 16) return -1;
    int fd = open(path, O_RDONLY);
    if (fd < 0) return -1;
    if (lseek(fd, -16, SEEK_END) < 0) {
        close(fd);
        return -1;
    }
    unsigned char footer[16];
    if (read(fd, footer, 16) != 16) {
        close(fd);
        return -1;
    }
    close(fd);
    if (memcmp(footer + 8, MAGIC, 8) != 0) return -1;
    uint64_t value = 0;
    for (int i = 0; i < 8; i++) value |= (uint64_t)footer[i] << (8 * i);
    if (value == 0 || value >= (uint64_t)st.st_size - 16) return -1;
    *off = value;
    return 0;
}

static int stamp_matches(const char *stamp_path, uint64_t size) {
    FILE *file = fopen(stamp_path, "r");
    if (!file) return 0;
    unsigned long long found = 0;
    int ok = fscanf(file, "%llu", &found) == 1 && found == (unsigned long long)size;
    fclose(file);
    return ok;
}

static int write_stamp(const char *stamp_path, uint64_t size) {
    FILE *file = fopen(stamp_path, "w");
    if (!file) return -1;
    fprintf(file, "%llu\n", (unsigned long long)size);
    fclose(file);
    return 0;
}

static int extract_payload(const char *self, uint64_t off, const char *dest) {
    char payload[1100];
    snprintf(payload, sizeof payload, "%s/payload.tar.xz", dest);
    int in = open(self, O_RDONLY);
    if (in < 0) return -1;
    struct stat st;
    if (fstat(in, &st) != 0 || lseek(in, (off_t)off, SEEK_SET) < 0) {
        close(in);
        return -1;
    }
    uint64_t left = (uint64_t)st.st_size - 16 - off;
    int out = open(payload, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (out < 0) {
        close(in);
        return -1;
    }
    char buf[65536];
    while (left) {
        size_t chunk = left > sizeof buf ? sizeof buf : (size_t)left;
        ssize_t got = read(in, buf, chunk);
        if (got <= 0) {
            close(in);
            close(out);
            return -1;
        }
        ssize_t wrote = 0;
        while (wrote < got) {
            ssize_t n = write(out, buf + wrote, (size_t)(got - wrote));
            if (n < 0) {
                close(in);
                close(out);
                return -1;
            }
            wrote += n;
        }
        left -= (uint64_t)got;
    }
    close(in);
    close(out);

    pid_t pid = fork();
    if (pid < 0) return -1;
    if (pid == 0) {
        execlp(
            "python3", "python3", "-c",
            "import os,sys,tarfile\n"
            "dest,src=sys.argv[1],sys.argv[2]\n"
            "os.makedirs(dest,exist_ok=True)\n"
            "with tarfile.open(src,'r:xz') as t:\n"
            "    t.extractall(dest, filter='data') if hasattr(tarfile,'data_filter') else t.extractall(dest)\n",
            dest, payload, (char *)NULL);
        _exit(127);
    }
    int status = 1;
    waitpid(pid, &status, 0);
    unlink(payload);
    return status == 0 ? 0 : -1;
}

int main(void) {
    char *self = self_path();
    if (!self) {
        show_error("Could not find the ENHANCE program file.");
        return 1;
    }
    uint64_t off = 0;
    if (read_footer(self, &off) != 0) {
        show_error("This ENHANCE file is damaged. Download it again.");
        free(self);
        return 1;
    }
    const char *home = getenv("HOME");
    if (!home || !home[0]) {
        show_error("HOME is not set, so ENHANCE cannot unpack itself.");
        free(self);
        return 1;
    }
    const char *xdg = getenv("XDG_CACHE_HOME");
    char base[1024];
    if (xdg && xdg[0]) snprintf(base, sizeof base, "%s/enhance-dlss5", xdg);
    else snprintf(base, sizeof base, "%s/.cache/enhance-dlss5", home);
    char app[1100], stamp[1100], agent[1200], seven[1200];
    snprintf(app, sizeof app, "%s/app", base);
    snprintf(stamp, sizeof stamp, "%s/stamp", base);
    snprintf(agent, sizeof agent, "%s/usr/share/forge/forge_agent.py", app);
    snprintf(seven, sizeof seven, "%s/usr/bin/7zz", app);
    if (mkdir_p(base) != 0) {
        show_error("Could not create the ENHANCE cache folder.");
        free(self);
        return 1;
    }
    struct stat st;
    if (stat(self, &st) != 0) {
        show_error("Could not read the ENHANCE program file.");
        free(self);
        return 1;
    }
    if (!stamp_matches(stamp, (uint64_t)st.st_size) || access(agent, R_OK) != 0) {
        if (mkdir_p(app) != 0 || extract_payload(self, off, app) != 0 || access(agent, R_OK) != 0) {
            show_error("ENHANCE needs python3, which Arch, CachyOS, Fedora, and Debian already include. Unpack failed.");
            free(self);
            return 1;
        }
        chmod(seven, 0755);
        write_stamp(stamp, (uint64_t)st.st_size);
    }
    free(self);
    setenv("FORGE_BUNDLED_7Z", seven, 1);
    unsetenv("LD_LIBRARY_PATH");
    execlp("python3", "python3", agent, (char *)NULL);
    show_error("ENHANCE needs python3. Install python3, then open this file again.");
    return 1;
}
