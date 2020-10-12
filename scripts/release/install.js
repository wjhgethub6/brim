/* @noflow */
const fs = require("fs")
const os = require("os")
const installerWin = require("electron-winstaller")
const createDMG = require("electron-installer-dmg")
const createZip = require("electron-installer-zip")
const path = require("path")

const out = "./dist/installers"
const appPath = "dist/packages/Brim-darwin-x64/Brim.app"
const defaultLinuxOpts = {
  src: "./dist/packages/Brim-linux-x64",
  dest: out,
  rename: (dest) => {
    return path.join(dest, "<%= name %>_<%= arch %>.<%= ext %>")
  },
  options: {
    name: "brim",
    homepage: "https://www.brimsecurity.com",
    icon: "./dist/static/AppIcon.png",
    maintainer: "Brim Security, Inc. <support@brimsecurity.com>",
// sudo apt show suricata | grep Depends
    depends: ["python (>= 2.7) | python-argparse", "python-simplejson", "python:any (<< 2.8)", "python:any (>= 2.7~)", "libc6 (>= 2.27)", "libcap-ng0 (>= 0.7.9)", "libevent-2.1-6 (>= 2.1.8-stable)", "libevent-pthreads-2.1-6 (>= 2.1.8-stable)", "libgcc1 (>= 1:4.2)", "libgeoip1", "libgnutls30 (>= 3.6.5)", "libhiredis0.14 (>= 0.14.0)", "libhtp2 (>= 0.5.24+1git0439eed)", "libhyperscan5", "libjansson4 (>= 2.3)", "libltdl7 (>= 2.4.6)", "libluajit-5.1-2 (>= 2.0.4+dfsg)", "liblz4-1 (>= 0.0~r127)", "libmagic1 (>= 5.12)", "libnet1 (>= 1.1.5)", "libnetfilter-log1", "libnetfilter-queue1", "libnfnetlink0", "libnspr4 (>= 2:4.9-2~)", "libnss3 (>= 2:3.13.4-2~)", "libpcap0.8 (>= 1.0.0)", "libpcre3", "libprelude23 (>= 4.1)", "libyaml-0-2", "zlib1g (>= 1:1.1.4)", "lsb-base (>= 3.0-6)"]
  }
}

module.exports = {
  darwin: async function() {
    console.log("Building installer for darwin")
    await createDMG(
      {
        overwrite: true,
        appPath,
        name: "Brim",
        out
      },
      (err) => {
        if (err) {
          throw new Error("Error builing darwin installer " + err)
        }
        console.log("Built installer for darwin in " + out)
      }
    )

    await createZip(
      {
        dir: appPath,
        out: path.join(out, "Brim-darwin-autoupdater.zip")
      },
      (err) => {
        if (err) {
          throw new Error("Error zipping darwin package: " + err)
        }
        console.log("Zip for darwin package written in " + out)
      }
    )
  },

  win32: function(opts) {
    console.log("Building installer for win32")
    fixWindowsInstallerDeps()
    return installerWin
      .createWindowsInstaller({
        ...opts,
        appDirectory: "./dist/packages/Brim-Win32-x64",
        outputDirectory: out,
        authors: "Brim Security, Inc.",
        exe: "Brim.exe",
        setupExe: "Brim-Setup.exe",
        noMsi: true
      })
      .then(() => {
        console.log("Built installer for win32 in " + out)
      })
      .catch(() => {
        // Exception caught above is not printed below, as a bubbling
        // up exception may contain a passphrase.
        console.log("Error building win32 installer")
      })
  },

  debian: function() {

    console.log("Building deb package installer")
    // https://github.com/brimsec/brim/issues/724
    // electron-installer-debian isn't available on Windows. It's an
    // optionalDependency, so the require can't be module-scoped.
    const installerDebian = require("electron-installer-debian")
    return installerDebian({
      ...defaultLinuxOpts,
      ext: "deb",
      arch: "amd64"
    })
  },

  redhat: function() {
    console.log("Building rpm package installer")
  }
}

function fixWindowsInstallerDeps() {
  // Hack Workaround
  // We needed to download 7 Zip 32bit and copy it into electron-winstaller/vendor
  // to replace the 64bit version in there that does not work on our 32bit wine
  // installation.
  //
  // https://github.com/electron/windows-installer/issues/186#issuecomment-313222658
  if (os.platform() === "darwin") {
    fs.copyFileSync(
      path.join(__dirname, "vendor", "7z.exe"),
      "node_modules/electron-winstaller/vendor/7z.exe"
    )
    fs.copyFileSync(
      path.join(__dirname, "vendor", "7z.dll"),
      "node_modules/electron-winstaller/vendor/7z.dll"
    )
  }
}
