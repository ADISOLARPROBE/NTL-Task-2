JWT-Authentication`.

## Folder Structure

```
intro-to-backend/
├── .env
├── .gitignore
├── README.md
├── package.json
└── backend/
    └── src/
        ├── app.js
        ├── index.js
        ├── config/
        │   ├── constants.js
        │   └── database.js
        ├── controllers/
        │   ├── post.controller.js
        │   └── user.controller.js
        ├── models/
        │   ├── post.model.js
        │   └── user.model.js
        └── routes/
            ├── post.route.js
            └── user.route.js