#!/bin/python

import json

add_org = "groovy add_organism.groovy -name '{NAME} [{ANNOTATION_VERSION}]' -url http://apollo:8080 -directory /data/apollo_data/{ORGANISM_ABBREV} -username 'admin@local.host' -password  $APOLLO_ADMIN_PASSWORD"
alter_group = "groovy alter_group_permissions.groovy -groupname remote_users -organism '{NAME} [{ANNOTATION_VERSION}]' -permission READ -destinationurl http://apollo:8080 -adminusername 'admin@local.host' -adminpassword $APOLLO_ADMIN_PASSWORD"

with open('organismList.json','r') as f:
    for line in json.load(f)['organisms']:
        print add_org.format(**line)
        print alter_group.format(**line)


