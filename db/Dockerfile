FROM postgres:16-alpine

COPY db/init/00_create_user.sh /docker-entrypoint-initdb.d/00_create_user.sh
COPY avacnesproyecto2.sql /docker-entrypoint-initdb.d/01_schema_data.sql
COPY db/extras.sql /docker-entrypoint-initdb.d/02_views.sql
COPY db/init/03_auth.sh /docker-entrypoint-initdb.d/03_auth.sh
COPY db/init/04_roles.sh /docker-entrypoint-initdb.d/04_roles.sh
COPY db/init/05_procedures.sh /docker-entrypoint-initdb.d/05_procedures.sh
COPY db/init/99_permissions.sh /docker-entrypoint-initdb.d/99_permissions.sh

RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/*.sh \
  && chmod +x /docker-entrypoint-initdb.d/*.sh
