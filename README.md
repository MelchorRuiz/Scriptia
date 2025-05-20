# SCRIPTIA

<div align="center">
    <img src="./public/logo.png" alt="Logo del proyecto" width="200">
</div>

## Descripción

Scriptia es una red social diseñada para los entusiastas de Linux. Aquí puedes crear, probar y compartir tus propios scripts hechos en Bash, Python o NodeJs, conocer a otros usuarios apasionados y aprender mucho de toda la comunidad.
La aplicación incluye un playground hecho con Docker para la ejecución de código, lo que permite que los usuarios puedan instalar las dependencias que necesiten y que la ejecución de código sea en un entorno aislado.

# Demo
https://scriptia.melchor-ruiz.fr/

# Capturas de pantalla

![Captura de pantalla 1](./public/screenshot-1.png)
![Captura de pantalla 2](./public/screenshot-2.png)
![Captura de pantalla 3](./public/screenshot-3.png)
![Captura de pantalla 4](./public/screenshot-4.png)

# ¿Cómo se ha utilizado Clerk?

Toda la gestión de usuarios es controlada por Clerk. Como toda red social, es necesario estar logueado para poder publicar y visualizar las publicaciones de los otros usuarios. Esto me permite solo almacenar el ID de un usuario (generado por Clerk) en mi base de datos en lugar de toda su información.
