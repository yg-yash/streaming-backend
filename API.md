# API Documentation

## Base URL

```
http://localhost:3000
```

---

## Endpoints

### 1. GET `/`
#### Description:
- Returns a welcome message from the root path.
- Useful for health check.

#### Request:
- Method: `GET`
- URL: `/`

#### Response (Sample):
```
Hello World!
```

---

## User Management
All endpoints are prefixed with `/user`.

### 2. POST `/user`
#### Description:
- Creates a new user.

#### Request:
- Method: `POST`
- URL: `/user`
- Body (JSON):
```json
{
  "username": "string",
  "favoriteGenres": ["string"],
  "dislikedGenres": ["string"]
}
```

#### Responses:
- `201 Created`: User successfully created.
- `409 Conflict`: Username already exists.

### 3. GET `/user`
#### Description:
- Retrieves user details by username.

#### Request:
- Method: `GET`
- URL: `/user?username={username}`
- Query Parameters:
  - `username` (required): The username of the user to retrieve.

#### Responses:
- `200 OK`: User details returned.
- `404 Not Found`: User not found.

---

## MyList Feature
All endpoints are prefixed with `/mylist`.

### 4. POST `/mylist`
#### Description:
- Adds a movie or TV show to the user's "My List". `contentType` is automatically determined by the backend based on `contentId`.

#### Request:
- Method: `POST`
- URL: `/mylist`
- Body (JSON):
```json
{
  "username": "string",
  "contentId": "string"
}
```

#### Response:
- `201 Created`: Item successfully added, returns the new item object.
- `409 Conflict`: Item already exists in the user's list.
- `404 Not Found`: User or content (movie/TV show) not found.

---

### 5. DELETE `/mylist/:username/:contentId`
#### Description:
- Removes a specific item (movie or TV show) from a user's list.

#### Request:
- Method: `DELETE`
- URL: `/mylist/:username/:contentId`
- Params:
  - `username`: The username of the user
  - `contentId`: The ID of the movie or TV show to remove

#### Response:
- `200 OK`: Item successfully removed: `{ "message": "Item removed successfully" }`
- `404 Not Found`: User or item not found in the user's list.

---

### 6. GET `/mylist`
#### Description:
- Retrieve all items in a user's list with pagination.

#### Request:
- Method: `GET`
- URL: `/mylist`
- Query Parameters:
  - `username` (required): The username of the user.
  - `page` (optional): Page number (default: 1).
  - `limit` (optional): Items per page (default: 10).

#### Response (`200 OK`):
```json
{
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "contentId": "string",
      "contentType": "Movie" | "TVShow",
      "contentDetails": { /* Object from Movie or TVShow schema */ }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "totalPages": "number"
}
```

---

## Content Listing
All endpoints are prefixed with `/content`.

### 7. GET `/content`
#### Description:
- Retrieves a paginated list of movies, TV shows, or both.

#### Request:
- Method: `GET`
- URL: `/content`
- Query Parameters:
  - `type` (optional): Filter by content type ('Movie' or 'TVShow').
  - `page` (optional): Page number (default: 1).
  - `limit` (optional): Items per page (default: 10).

#### Response (`200 OK`):
```json
{
  "data": [
    { /* Object from Movie or TVShow schema */ }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "totalPages": "number"
}
```

---

## Notes
- The API now largely uses `username` to identify users instead of internal `userId`s.
- `contentType` is automatically determined by the backend for `POST /mylist`.
- Responses may return validation or error messages for missing/invalid data or duplicate operations.

## Schemas

### User
```
username: string (unique)
favoriteGenres: string[]
dislikedGenres: string[]
watchHistory: [
  {
    contentId: string,
    watchedOn: Date,
    rating?: number
  }
]
```

### MyListItem
```
userId: string // User's ObjectId
contentId: string // Movie or TVShow ObjectId
contentType: 'Movie' | 'TVShow'
```

### Movie
```
title: string
description?: string
genres: string[]
releaseDate?: Date
director?: string
actors?: string[]
```

### TVShow
```
title: string
description?: string
genres: string[]
episodes: [
  {
    episodeNumber: number,
    seasonNumber: number,
    releaseDate: Date,
    director: string,
    actors: string[]
  }
]
```
