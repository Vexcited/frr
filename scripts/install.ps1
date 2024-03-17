param (
  [string] $version
)

$PSMinVersion = 3

if ($v) {
  $version = $v
}

function Write-Emphasized {
  param (
    [Parameter(Mandatory)]
    [string] $Text
  )
    
  Write-Host -Object $Text -NoNewline -ForegroundColor "Cyan"
}

function Write-Log {
  param (
    [string] $ActionText,
    [string[]] $Texts,
    [boolean[]] $Emphasized
  )

  if (-not (Test-Path -Path $logFileDir)) {
    New-Item -Path $logFileDir -ItemType File -Force | Out-Null
  }

  if (-not ($ActionText)) {
    $FormattedActionText = "{0, -15}" -f $ActionText
    Write-Host -Object $FormattedActionText -NoNewline
  }
    
  $logText = $FormattedActionText
    
  for ($i = 0; $i -lt $Texts.Length -and $Texts.Length -eq $Emphasized.Length; $i++) {
    if ($Emphasized.Get($i)) {
      Write-Host -Object $Texts.Get($i) -NoNewline
    }
    else {
      Write-Host -Object $Texts.Get($i) -NoNewline
    }
    $logText = $LogText + $Texts.Get($i)
  }
  $logText = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss yyyy-MM-dd"), $LogText
  Add-Content -Path $logFileDir -Value $LogText -NoNewline
}

function Write-Done {
  Write-Host -Object " > " -NoNewline
  Write-Host -Object "OK" -ForegroundColor "Green"
  Add-Content -Path $logFileDir -Value " > OK"
}

if ($PSVersionTable.PSVersion.Major -ge $PSMinVersion) {
  $ErrorActionPreference = "Stop"
    
  # Enable TLS 1.2 since it is required.
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    
  # Create %localappdata%\frr-cli directory if it doesn't already exist
  $frrCliDir = "$env:LOCALAPPDATA\frr-cli"
  $logFileDir = "$frrCliDir\install.log"

  $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  $isAdmin = $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

  if ($isAdmin) {
    Write-Log -ActionText "ATTENTION" -Texts "This script was not ran as Administrator which isn't recommended`n" -Emphasized $false
    $Host.UI.RawUI.Flushinputbuffer()
    $choice = $Host.UI.PromptForChoice("", "Do you want to abort the installation process to avoid any issues?", ("&Yes", "&No"), 0)
    if ($choice -eq 0) {
      Write-Log -ActionText "ATTENTION" -Texts "Exiting the script..." -Emphasized $false
      exit
    }
  }
    
  if (-not (Test-Path -Path $frrCliDir)) {
    Write-Log -ActionText "DOSSIER" -Texts $frrCliDir -Emphasized $true
    Write-Done
  }
    
  # Download latest action build.
  $zipFile = "${frrCliDir}\frr-cli-windows.zip"
  $downloadUri = "https://nightly.link/Vexcited/frr/workflows/binary/main/windows-latest.zip"
  Write-Log -ActionText "RECEPTION" -Texts $downloadUri -Emphasized $true
  Invoke-WebRequest -Uri $downloadUri -UseBasicParsing -OutFile $zipFile
  Write-Done
    
  # Extract `frr-win.exe` from .zip file.
  Write-Log -ActionText "EXTRACTION" -Texts $zipFile, " dans ", ${frrCliDir} -Emphasized $true, $false, $true
  # Using -Force to overwrite `frr-win.exe` if it already exists
  Expand-Archive -Path $zipFile -DestinationPath $frrCliDir -Force
  Write-Done
    
  # Remove .zip file.
  Write-Log -ActionText "SUPPRESSION" -Texts $zipFile -Emphasized $true
  Remove-Item -Path $zipFile
  Write-Done
  
  Write-Log -ActionText "RENOMMAGE" -Texts $frrCliDir, " 'frr-win.exe' en 'frr.exe' " -Emphasized $true, $false
  Move-Item -Path "${frrCliDir}\frr-win.exe" -Destination "${frrCliDir}\frr.exe" -Force
  Write-Done
  
  # Get Path environment variable for the current user.
  $user = [EnvironmentVariableTarget]::User
  $path = [Environment]::GetEnvironmentVariable("PATH", $user)
    
  # Check whether `frr-cli` dir is in the Path.
  $paths = $path -split ";"
  $isInPath = $paths -contains $frrCliDir -or $paths -contains "${frrCliDir}\"
  
  # Add `frr-cli` dir to PATH if it hasn't been added already.
  if (-not $isInPath) {
    Write-Log -ActionText "AJOUT" -Texts $frrCliDir, " aux variables d'envrionnement ", "PATH" -Emphasized $true, $false, $true
    [Environment]::SetEnvironmentVariable("PATH", "${path};${frrCliDir}", $user)
    # Add `frr-cli` to the PATH variable of the current terminal session
    # so `frr` can be used immediately without restarting the terminal.
    $env:PATH += ";${frrCliDir}"
    Write-Done
  }
}
else {
  Write-Log -Texts "`nYour Powershell version is lesser than ", "$PSMinVersion" -Emphasized $false, $true
  Write-Log -Texts "`nPlease, update your Powershell downloading the ", "'Windows Management Framework'", " greater than ", "$PSMinVersion" -Emphasized $false, $true, $false, $true
}