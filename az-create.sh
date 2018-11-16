
az vm create \
  -n vm \
  -g addis-resources \
  --image Canonical:UbuntuServer:18.04-LTS:18.04.201811010 \
  --custom-data cloud-init.yaml \
  --ssh-key-value @~/.ssh/id_rsa.pub \
  --public-ip-address-dns-name pataviserver \
  --generate-ssh-keys
  --boot-diagnostics-storage ygstor