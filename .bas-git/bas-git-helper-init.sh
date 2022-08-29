#!/bin/bash

action=$1

if [ "$action" = "get" ] || [ "$action" = "store" ]
then
    credentialHelperContext=`cat /dev/stdin`
    customHelperName=`basctl --command sapbas.gitAuthenticationGetCustomHelperName --param "${credentialHelperContext}"`
    status=$?
    if [ ${status} != 0 ]
    then
        exit ${status}
    fi   
	
    # if no global credential helper is configured for the current context, configure bas custom helper for this context
    globalConfig=`git config --global --get-all ${customHelperName}`
    if [ -z "${globalConfig}" ]
    then
        /home/user/.bas-git/bas-git-helper.sh $action ${customHelperName} "${credentialHelperContext}"
    fi
fi 