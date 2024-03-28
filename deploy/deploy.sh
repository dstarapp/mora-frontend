#/bin/sh

NETWORK=""
while getopts "r:" opt
do
  case $opt in
    r)
      NETWORK=${OPTARG}
    ;;
  esac
done

if [ -z "$NETWORK" ]
then
  echo "must be usage -r"
  exit 1
fi

# echo $NETWORK;
# cp wellknown
\cp -rf ./deploy/$NETWORK/.well-known ./public/
\cp -rf ./deploy/$NETWORK/.ic-assets.json ./public/

# copy js config file
\cp -rf ./deploy/$NETWORK/index.ts ./frontend/assets/config/index.ts

npm run vite
dfx deploy --network $NETWORK assets
