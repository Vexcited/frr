#!/usr/bin/env bash
set -e

while getopts ":r" arg; do
	case "${arg}" in
		"r") override_root=1 ;;
	esac
done

is_root() {
	[ "${EUID:-$(id -u)}" -eq 0 ];
}

if is_root && [ "${override_root:-0}" -eq 0 ]; then
	echo "The script was ran as root. Script will now exit"
	echo "If you did not intend to do this, please run the script without root permissions to avoid issues with Spicetify"
	echo "You can override this behavior by passing '-r' or '--root' flag to this script"
	exit
fi

# wipe existing log
> install.log

log() {
	echo $1
	echo "["$(date +'%H:%M:%S %Y-%m-%d')"]" $1 >> install.log
}

case $(uname -sm) in
	"Darwin x86_64") target="macos-latest" ;;
	"Linux x86_64") target="ubuntu-latest" ;;
	*) log "Unsupported platform $(uname -sm). x86_64 binaries for Linux and Darwin are available."; exit ;;
esac

# check for dependencies
command -v curl >/dev/null || { log "curl isn't installed\!" >&2; exit 1; }
command -v unzip >/dev/null || { log "unzip isn't installed\!" >&2; exit 1; }
command -v grep >/dev/null || { log "grep isn't installed\!" >&2; exit 1; }

download_uri=https://nightly.link/Vexcited/frr/workflows/binary/main/$target.zip

# locations
frr_cli_install="$HOME/.frr-cli"
exe="$frr_cli_install/frr"
zip="$frr_cli_install/frr.zip"

# installing
[ ! -d "$frr_cli_install" ] && log "CREATING $frr_cli_install" && mkdir -p "$frr_cli_install"

log "DOWNLOADING $download_uri"
curl --fail --location --progress-bar --output "$zip" "$download_uri"

log "EXTRACTING $zip"
unzip "$zip" -d "$frr_cli_install"

log "REMOVING -unix from binary name"
mv "$frr_cli_install/frr-unix" "$exe"

log "SETTING EXECUTABLE PERMISSIONS TO $exe"
chmod +x "$exe"

log "REMOVING $zip"
rm "$zip"

notfound() {
	cat << EOINFO
Manually add the directory to your \$PATH through your shell profile
export FRR_CLI_INSTALL="$frr_cli_install"
export PATH="\$PATH:\$FRR_CLI_INSTALL"
EOINFO
}

endswith_newline() {
    [[ $(tail -c1 "$1" | wc -l) -gt 0 ]]
}

check() {
	local path="export PATH=\$PATH:$frr_cli_install"
	local shellrc=$HOME/$1
	
	if [ "$1" == ".zshrc" ] && [ ! -z "${ZDOTDIR}" ]; then
		shellrc=$ZDOTDIR/$1
	fi

	# Create shellrc if it doesn't exist
	if ! [ -f $shellrc ]; then
		log "CREATING $shellrc"
		touch $shellrc
	fi

	# Still checking again, in case touch command failed
	if [ -f $shellrc ]; then
		if ! grep -q $frr_cli_install $shellrc; then
			log "APPENDING $frr_cli_install to PATH in $shellrc"
			if ! endswith_newline $shellrc; then
				echo >> $shellrc
			fi
			echo ${2:-$path} >> $shellrc
			log "Restart your shell to have frr in your PATH."
		else
			log "frr path already set in $shellrc, continuing..."
		fi
	else
		notfound
	fi
}

case $SHELL in
	*zsh) check ".zshrc" ;;
	*bash)
		[ -f "$HOME/.bashrc" ] && check ".bashrc"
		[ -f "$HOME/.bash_profile" ] && check ".bash_profile"
	;;
	*fish) check ".config/fish/config.fish" "fish_add_path $frr_cli_install" ;;
	*) notfound ;;
esac

echo
log "frr cli was installed successfully to $frr_cli_install"
log "Run 'frr' to get started"