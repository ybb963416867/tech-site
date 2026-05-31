---
title: "zygote 的启动流程"
description: "启动init进程 [源码链接](http://androidxref.com/9.0.0r3/xref/system/core/init/init.cpp)"
pubDate: 2026-05-29
category: "Framwork"
tags: [Array]
draft: false
---
## zygote  的启动

> 启动init进程 [源码链接](http://androidxref.com/9.0.0_r3/xref/system/core/init/init.cpp)

```
545 int main(int argc, char** argv) {
546    if (!strcmp(basename(argv[0]), "ueventd")) {
547        return ueventd_main(argc, argv);
548    }
549
550    if (!strcmp(basename(argv[0]), "watchdogd")) {
551        return watchdogd_main(argc, argv);
552    }
553
554    if (argc > 1 && !strcmp(argv[1], "subcontext")) {
555        InitKernelLogging(argv);
556        const BuiltinFunctionMap function_map;
557        return SubcontextMain(argc, argv, &function_map);
558    }
559
560    if (REBOOT_BOOTLOADER_ON_PANIC) {
561        InstallRebootSignalHandlers();
562    }
563
564    bool is_first_stage = (getenv("INIT_SECOND_STAGE") == nullptr);
565
566    if (is_first_stage) {
567        boot_clock::time_point start_time = boot_clock::now();
568
569        // Clear the umask.
570        umask(0);
571
572        clearenv();
573        setenv("PATH", _PATH_DEFPATH, 1);
574        // Get the basic filesystem setup we need put together in the initramdisk
575        // on / and then we'll let the rc file figure out the rest.
576        mount("tmpfs", "/dev", "tmpfs", MS_NOSUID, "mode=0755");
577        mkdir("/dev/pts", 0755);
578        mkdir("/dev/socket", 0755);
579        mount("devpts", "/dev/pts", "devpts", 0, NULL);
580        #define MAKE_STR(x) __STRING(x)
581        mount("proc", "/proc", "proc", 0, "hidepid=2,gid=" MAKE_STR(AID_READPROC));
582        // Don't expose the raw commandline to unprivileged processes.
583        chmod("/proc/cmdline", 0440);
584        gid_t groups[] = { AID_READPROC };
585        setgroups(arraysize(groups), groups);
586        mount("sysfs", "/sys", "sysfs", 0, NULL);
587        mount("selinuxfs", "/sys/fs/selinux", "selinuxfs", 0, NULL);
588
589        mknod("/dev/kmsg", S_IFCHR | 0600, makedev(1, 11));
590
591        if constexpr (WORLD_WRITABLE_KMSG) {
592            mknod("/dev/kmsg_debug", S_IFCHR | 0622, makedev(1, 11));
593        }
594
595        mknod("/dev/random", S_IFCHR | 0666, makedev(1, 8));
596        mknod("/dev/urandom", S_IFCHR | 0666, makedev(1, 9));
597
598        // Mount staging areas for devices managed by vold
599        // See storage config details at http://source.android.com/devices/storage/
600        mount("tmpfs", "/mnt", "tmpfs", MS_NOEXEC | MS_NOSUID | MS_NODEV,
601              "mode=0755,uid=0,gid=1000");
602        // /mnt/vendor is used to mount vendor-specific partitions that can not be
603        // part of the vendor partition, e.g. because they are mounted read-write.
604        mkdir("/mnt/vendor", 0755);
605
606        // Now that tmpfs is mounted on /dev and we have /dev/kmsg, we can actually
607        // talk to the outside world...
608        InitKernelLogging(argv);
609
610        LOG(INFO) << "init first stage started!";
611
612        if (!DoFirstStageMount()) {
613            LOG(FATAL) << "Failed to mount required partitions early ...";
614        }
615
616        SetInitAvbVersionInRecovery();
617
618        // Enable seccomp if global boot option was passed (otherwise it is enabled in zygote).
619        global_seccomp();
620
621        // Set up SELinux, loading the SELinux policy.
622        SelinuxSetupKernelLogging();
623        SelinuxInitialize();
624
625        // We're in the kernel domain, so re-exec init to transition to the init domain now
626        // that the SELinux policy has been loaded.
627        if (selinux_android_restorecon("/init", 0) == -1) {
628            PLOG(FATAL) << "restorecon failed of /init failed";
629        }
630
631        setenv("INIT_SECOND_STAGE", "true", 1);
632
633        static constexpr uint32_t kNanosecondsPerMillisecond = 1e6;
634        uint64_t start_ms = start_time.time_since_epoch().count() / kNanosecondsPerMillisecond;
635        setenv("INIT_STARTED_AT", std::to_string(start_ms).c_str(), 1);
636
637        char* path = argv[0];
638        char* args[] = { path, nullptr };
639        execv(path, args);
640
641        // execv() only returns if an error happened, in which case we
642        // panic and never fall through this conditional.
643        PLOG(FATAL) << "execv(\"" << path << "\") failed";
644    }

```

> 启动的相关代码
[源码链接](http://androidxref.com/9.0.0_r3/xref/frameworks/base/cmds/app_process/app_main.cpp)

> 在目录/frameworks/base/cmds/app_process/app_main.cpp

```
349    if (zygote) {
350        runtime.start("com.android.internal.os.ZygoteInit", args, zygote);
351    } else if (className) {
352        runtime.start("com.android.internal.os.RuntimeInit", args, zygote);
353    } else {
354        fprintf(stderr, "Error: no class name or --zygote supplied.\n");
355        app_usage();
356        LOG_ALWAYS_FATAL("app_process: no class name or --zygote supplied.");
357    }
```