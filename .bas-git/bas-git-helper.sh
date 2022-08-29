#!/bin/bash

action=$1
customHelperName=$2
# context conatins protocol and host in case of get action
# context conatins protocol and host and credentials in case of store action
credentialHelperContext=$3

if [ "${action}" = "store" ] && [ ! -z "${customHelperName}" ]
then
    builtinHelperName=`basctl --command sapbas.gitAuthenticationGetBuiltinHelperName --param "${credentialHelperContext}"`
    status=$?
    if [ ${status} != 0 ]
    then
        exit ${status}
    fi

    if [ "${builtinHelperName}" = "store" ]
    then
        # add the store credential helper as first per context and ask it to save the received from the user credentials
        git config --global --add ${customHelperName} store
        printf "${credentialHelperContext}" | git-credential-store store
    elif [ "${builtinHelperName}" = "cache" ]
    then
        # add the cache credential helper as first per context and ask it to save the received from the user credentials
        # timeout is 24 hours - it will keep till devspace restarting
        git config --global --add ${customHelperName} "cache --timeout=86400"
        printf "${credentialHelperContext}" | git-credential-cache store
    else 
        exit 1
    fi

    # add the custom credential helper as second per context
    git config --global --add ${customHelperName} /home/user/.bas-git/bas-git-helper.sh

elif [ "${action}" = "get" ]
then
    if [ -z "${credentialHelperContext}" ]
    then
        # called by git after credentials erased from builtin helper as a result of:
        # changing password on git server (relevant for both store and cache) or
        # timeout or devspace restart (relevant for cache)
        credentialHelperContext=`cat /dev/stdin`
    fi    
    # else called from bas-git-helper-init.sh with credentialHelperContext

    fullContext=`basctl --command sapbas.gitAuthenticationGetFullContext --param "${credentialHelperContext}"`
    
    # print the the received from the user credentials to stdout
    printf "%s" "${fullContext}"
fi 
