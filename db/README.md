**Database**
Use MySQL

Main setup (do this first time only):
Run:
mysql -u root -p -e "CREATE DATABASE Visionary;"

Current Schema:
mysql -u root -p team_project < db/schema.sql

Current Mock data:
mysql -u root -p team_project < db/seed.sql

All future modifications will have changes to schema and seed files, only need to reimport.