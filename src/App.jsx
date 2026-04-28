import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "",
  });

  // List of items from backend
  const [items, setItems] = useState([]);

  // Store the item id when editing
  const [editingId, setEditingId] = useState(null);

  // Messages
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // Fetch all items from backend
  // -------------------------------
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/items`);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setMessage(error.message || "Failed to load items");
    }
  };

  // Run once when page loads
  useEffect(() => {
    fetchItems();
  }, []);

  // -------------------------------
  // Handle input changes
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------------
  // Clear form
  // -------------------------------
  const clearForm = () => {
    setFormData({
      name: "",
      quantity: "",
      price: "",
      category: "",
    });
    setEditingId(null);
  };

  // -------------------------------
  // Add or update item
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Basic validation
    if (
      !formData.name ||
      formData.quantity === "" ||
      formData.price === "" ||
      !formData.category
    ) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (editingId) {
        // UPDATE existing item
        response = await fetch(`${API_URL}/api/items/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // CREATE new item
        response = await fetch(`${API_URL}/api/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(editingId ? "Item updated successfully" : "Item added successfully");
      clearForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Load selected item into form
  // -------------------------------
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
    });

    setEditingId(item._id);
    setMessage("Editing selected item");
  };

  // -------------------------------
  // Delete item
  // -------------------------------
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      setMessage(error.message);
    }
  };

  return (
    <div className="container">
      <h1>Item Manager</h1>
      <p className="subtitle">MERN Lab Test Practice Project</p>

      <div className="card">
        <h2>{editingId ? "Edit Item" : "Add New Item"}</h2>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="name"
            placeholder="Enter item name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Enter quantity"
            value={formData.quantity}
            onChange={handleChange}
          />

          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Enter price"
            value={formData.price}
            onChange={handleChange}
          />

          <input
            type="text"
            name="category"
            placeholder="Enter category"
            value={formData.category}
            onChange={handleChange}
          />

          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                ? "Update Item"
                : "Add Item"}
            </button>

            <button type="button" className="secondary" onClick={clearForm}>
              Clear
            </button>
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      <div className="card">
        <h2>All Items</h2>

        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          <div className="item-list">
            {items.map((item) => (
              <div key={item._id} className="item-box">
                <h3>{item.name}</h3>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Price:</strong> Rs. {item.price}</p>
                <p><strong>Category:</strong> {item.category}</p>

                <div className="button-group">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;