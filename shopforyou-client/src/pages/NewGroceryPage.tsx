import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

interface Category {
  id: number;
  name: string;
}

interface DecodedToken {
  role: string;
}

const NewGroceryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    image: null as File | null,
    categoryId: '',
    price: '',
    description: '',
    amount: '',
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('Access denied. Please log in as an admin.');
      navigate('/');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.role !== 'admin') {
        alert('Access denied. Admins only.');
        navigate('/');
      }
    } catch (error) {
      console.error('Invalid token:', error);
      alert('Access denied. Please log in as an admin.');
      navigate('/');
    }
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3005/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    if (formData.image) {
      data.append('image', formData.image);
    }
    data.append('type', formData.categoryId);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('amount', formData.amount);

    try {
      await axios.post('http://localhost:3005/api/groceries', data);
      alert('Grocery added successfully!');
      navigate('/'); // Redirect to the main page
    } catch (error) {
      console.error('Failed to add grocery:', error);
      alert('Failed to add grocery.');
    }
  };

  return (
    <div>
      <h1>Add New Grocery</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Image:</label>
          <input type="file" name="image" onChange={handleFileChange} required />
        </div>
        <div>
          <label>Category:</label>
          {isAddingCategory ? (
            <input
              type="text"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              placeholder="Enter new category"
              required
            />
          ) : (
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={(e) => {
                if (e.target.value === 'add-new') {
                  setIsAddingCategory(true);
                  setFormData({ ...formData, categoryId: '' });
                } else {
                  setFormData({ ...formData, categoryId: e.target.value });
                }
              }}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
              <option value="add-new">Add New Category</option>
            </select>
          )}
        </div>
        <div>
          <label>Price:</label>
          <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Amount:</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required />
        </div>
        <button type="submit">Add Grocery</button>
      </form>
    </div>
  );
};

export default NewGroceryPage;