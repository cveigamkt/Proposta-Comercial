param(
  [int]$Port = 8080
)

# Ir para a pasta do script
Set-Location -Path $PSScriptRoot

# Selecionar porta disponível entre 8080,8081,8000,8001,8090
$ports = @($Port, 8081, 8000, 8001, 8090)
$chosen = $null
foreach ($p in $ports) {
  try {
    $test = Test-NetConnection -ComputerName '127.0.0.1' -Port $p -WarningAction SilentlyContinue -InformationLevel Quiet
    if (-not $test) { $chosen = $p; break }
  } catch { $chosen = $p; break }
}
if (-not $chosen) { $chosen = $Port }

Write-Host "Iniciando servidor na porta $chosen..."

# Iniciar o servidor com npx http-server
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","npx http-server -p $chosen -a 0.0.0.0 ." -WorkingDirectory $PSScriptRoot

# Abrir o navegador na página principal após um pequeno atraso
Start-Sleep -Seconds 1
# Abrir a home
Start-Process "http://localhost:$chosen/index.html"
