# Image Upload Implementation Guide

## ✅ Backend Changes Complete

### What Was Added

1. **Image Field in Equipment Model**

   - `image` field stores filename (e.g., "equipments-1736604123456-abc123.jpg")
   - Located at: `src/models/Equipment.js`

2. **Image Handler Utility**

   - `saveBase64Image()` - Converts base64 to file and saves it
   - `deleteImage()` - Deletes old images when updating
   - `isBase64Image()` - Validates base64 image data
   - Located at: `src/utils/imageHandler.js`

3. **Upload Directory Structure**

   ```
   public/
   └── uploads/
       └── equipments/
           ├── equipments-1234567890-abc123.jpg
           ├── equipments-1234567891-def456.png
           └── ...
   ```

4. **Static File Serving**

   - Images accessible at: `http://localhost:5000/uploads/equipments/filename.jpg`
   - Configured in: `src/app.js`

5. **Controller Updates**
   - `create()` - Handles base64 image on equipment creation
   - `update()` - Deletes old image and saves new one
   - `getAll()` - Returns image filename in response
   - `getById()` - Returns image filename in response
   - Located at: `src/controllers/equipmentController.js`

---

## Frontend Integration

### 1. Sending Image Data (Equipment Creation)

```javascript
// Example: Adding equipment with image
const addEquipment = async (formData) => {
  const payload = {
    name: formData.name,
    category: formData.category,
    description: formData.description,
    quantity: formData.quantity,
    dailyRate: formData.dailyRate,
    image: formData.imageBase64, // Send base64 string
  };

  const response = await fetch("http://localhost:5000/api/equipment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return response.json();
};
```

### 2. Converting Image to Base64

```javascript
// File input handler
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must be less than 5MB");
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData((prev) => ({
      ...prev,
      imageBase64: reader.result, // This is the base64 string
    }));
  };
  reader.readAsDataURL(file);
};
```

### 3. Displaying Images

```javascript
const EquipmentCard = ({ equipment }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "/placeholder.png"; // Your fallback image
    }

    // If it's already a base64 string (legacy data)
    if (imagePath.startsWith("data:")) {
      return imagePath;
    }

    // If it's a filename, construct URL
    return `http://localhost:5000/uploads/equipments/${imagePath}`;
  };

  return (
    <div className="equipment-card">
      <img
        src={getImageUrl(equipment.image)}
        alt={equipment.name}
        onError={(e) => {
          e.target.src = "/placeholder.png"; // Fallback on error
        }}
      />
      <h3>{equipment.name}</h3>
      <p>{equipment.description}</p>
    </div>
  );
};
```

### 4. Complete Add Equipment Form

```javascript
import React, { useState } from "react";

const AddEquipmentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Power Tools",
    description: "",
    quantity: 1,
    dailyRate: 0,
    imageBase64: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageBase64: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Equipment added successfully!");
        // Reset form
        setFormData({
          name: "",
          category: "Power Tools",
          description: "",
          quantity: 1,
          dailyRate: 0,
          imageBase64: null,
        });
        setImagePreview(null);
      }
    } catch (error) {
      alert("Failed to add equipment");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Equipment Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        required
      >
        <option value="Power Tools">Power Tools</option>
        <option value="Hand Tools">Hand Tools</option>
        <option value="Outdoor Equipment">Outdoor Equipment</option>
        {/* Add other categories */}
      </select>

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Daily Rate"
        value={formData.dailyRate}
        onChange={(e) =>
          setFormData({ ...formData, dailyRate: e.target.value })
        }
        required
      />

      {/* Image Upload */}
      <div className="image-upload">
        <label>Equipment Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px" }} />
        )}
      </div>

      <button type="submit">Add Equipment</button>
    </form>
  );
};

export default AddEquipmentForm;
```

---

## API Response Format

### POST /api/equipment (Create)

**Request:**

```json
{
  "name": "Power Drill",
  "category": "Power Tools",
  "description": "High-power cordless drill",
  "quantity": 5,
  "dailyRate": 15,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Equipment created successfully",
  "equipment": {
    "id": "678abc123def456789012345",
    "name": "Power Drill",
    "category": "Power Tools",
    "quantity": 5,
    "status": "available",
    "approved": true,
    "image": "equipments-1736604123456-abc123.jpg"
  }
}
```

### GET /api/equipment (List All)

**Response:**

```json
{
  "success": true,
  "count": 2,
  "equipment": [
    {
      "id": "678abc123def456789012345",
      "name": "Power Drill",
      "category": "Power Tools",
      "description": "High-power cordless drill",
      "quantity": 5,
      "dailyRate": 15,
      "status": "available",
      "approved": true,
      "image": "equipments-1736604123456-abc123.jpg",
      "createdBy": {
        "id": "123...",
        "name": "John Doe"
      },
      "createdAt": "2026-01-11T10:30:00.000Z"
    }
  ]
}
```

### GET /api/equipment/:id (Get Single)

**Response:**

```json
{
  "success": true,
  "equipment": {
    "id": "678abc123def456789012345",
    "name": "Power Drill",
    "category": "Power Tools",
    "description": "High-power cordless drill",
    "quantity": 5,
    "dailyRate": 15,
    "status": "available",
    "approved": true,
    "image": "equipments-1736604123456-abc123.jpg",
    "createdBy": {
      "id": "123...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2026-01-11T10:30:00.000Z",
    "updatedAt": "2026-01-11T10:30:00.000Z"
  }
}
```

---

## Image Access URLs

### Direct Image URL

```
http://localhost:5000/uploads/equipments/equipments-1736604123456-abc123.jpg
```

### In Frontend

```javascript
const imageUrl = `${
  process.env.REACT_APP_API_URL || "http://localhost:5000"
}/uploads/equipments/${equipment.image}`;
```

---

## Testing with Postman

### 1. Create Equipment with Image

**POST** `http://localhost:5000/api/equipment`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "name": "Circular Saw",
  "category": "Power Tools",
  "description": "Professional grade circular saw",
  "quantity": 3,
  "dailyRate": 20,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBg..."
}
```

### 2. Get Equipment List

**GET** `http://localhost:5000/api/equipment`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Access Image Directly

**GET** `http://localhost:5000/uploads/equipments/equipments-1736604123456-abc123.jpg`

No authentication required for viewing images.

---

## Environment Variables

Add to your `.env` file (optional):

```env
MAX_IMAGE_SIZE=5242880  # 5MB in bytes
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
```

---

## Important Notes

1. **Image Size Limit**: Backend accepts up to 10MB due to `app.use(express.json({ limit: "10mb" }))`

2. **Supported Formats**: jpg, jpeg, png, gif, webp

3. **Storage Location**: `public/uploads/equipments/`

4. **Database Storage**: Only filename is stored (efficient)

5. **Old Image Cleanup**: When updating equipment with new image, old image is automatically deleted

6. **Error Handling**: If image upload fails, equipment is still created/updated without image

7. **Security**: Images are publicly accessible (no auth required)

8. **Backwards Compatible**: Existing equipment without images will work fine

---

## Production Considerations

For production deployment:

1. **Use Cloud Storage** (AWS S3, Cloudinary, etc.)
2. **Add Image Compression** (sharp, imagemin)
3. **Implement CDN** for faster delivery
4. **Add Image Validation** (dimensions, malware scan)
5. **Use Environment Variables** for upload paths
6. **Add Rate Limiting** on upload endpoints
7. **Consider Signed URLs** for private images

---

## Troubleshooting

### Images not displaying?

- Check if file exists: `public/uploads/equipments/filename.jpg`
- Verify URL: `http://localhost:5000/uploads/equipments/filename.jpg`
- Check browser console for 404 errors
- Ensure static middleware is configured in `app.js`

### Upload failing?

- Check base64 format (must start with `data:image/...`)
- Verify JSON size limit in `app.js`
- Check folder permissions on `public/uploads/equipments/`
- Review backend logs for errors

### Images too large?

- Compress before upload (use canvas API or libraries)
- Increase limit in `app.js`: `express.json({ limit: "20mb" })`

---

## Complete! 🎉

Your backend is now fully configured to:

- ✅ Accept base64 image data
- ✅ Save images as files
- ✅ Store only filenames in database
- ✅ Serve images via static URL
- ✅ Handle image updates and deletions
- ✅ Return image data in API responses

Update your frontend to use the patterns shown above!
