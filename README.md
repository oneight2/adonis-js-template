# AdonisJS Custom Template

Template AdonisJS yang telah dimodifikasi dan dilengkapi dengan command `make:crud` untuk mempercepat proses development. Template ini memungkinkan Anda membuat Controller, Service, Model, Validator, dan Routes secara otomatis hanya dengan satu perintah.

## Fitur Utama

### Command: `make:crud`

Command otomatis yang menghasilkan file:

* Controller
* Service
* Model
* Validator
* Routes

### Catatan Penting

Sebelum menjalankan command `make:crud`, Anda harus membuat file migration terlebih dahulu. Migration wajib mengandung nama tabel/model yang benar karena command `make:crud` membaca nama model dari migration tersebut.

Contoh membuat migration:

```
node ace make:migration users
```

## Cara Menggunakan `make:crud`

Setelah migration dibuat, jalankan:

```
node ace make:crud <nama_table> <nama_model>
```

Contoh:

```
node ace make:crud users user
```

Command tersebut akan menghasilkan struktur:

```
app/
  Controllers/Http/UsersController.ts
  Services/UserService.ts
  Validators/UserValidator.ts
  Models/User.ts

start/
  routes/userRoutes.ts
```

## Menjalankan Development Server

```
node ace serve --hmr
```

## Debugging Menggunakan VSCode

Buat folder `.vscode` dan file `launch.json` dengan isi sebagai berikut:

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Dev server",
      "program": "${workspaceFolder}/ace.js",
      "args": ["serve", "--hmr"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Cara menjalankan debugging:

1. Buka menu Run and Debug di VSCode
2. Pilih "Dev server"
3. Tekan F5



