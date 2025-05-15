import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import GroceryForm from "../components/GroceryForm";
import { Box, Spinner } from "@chakra-ui/react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

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
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3005/api/categories');
      setCategories(response.data.categories);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      setError(error);
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setError(null);

    let imageUrl = "";
    if (values.image) {
      try {
        const imageFormData = new FormData();
        imageFormData.append("image", values.image);
        const serverResponse = await axios.post(
          "http://localhost:3005/api/upload-to-imgur",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        imageUrl = serverResponse.data.link;
      } catch (error) {
        setIsLoading(false);
        setIsError(true);
        setError(error);
        alert("Failed to upload image. Please try again.");
        return;
      }
    }

    const groceryData = {
      name: values.name,
      type: values.categoryId,
      price: values.price,
      description: values.description,
      amount: values.amount,
      image: imageUrl,
    };

    try {
      await axios.post(
        'http://localhost:3005/api/groceries',
        groceryData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setError(error);
      console.error('Failed to add grocery:', error);
    }
  };

  return (
    <Box>
      {isLoading && categories.length === 0 ? (
        <Spinner size="xl" />
      ) : (
        <GroceryForm
          initialValues={{
            name: '',
            image: null,
            categoryId: '',
            price: '',
            description: '',
            amount: '',
          }}
          categories={categories}
          isLoading={isLoading}
          isSuccess={isSuccess}
          isError={isError}
          error={error}
          onSubmit={handleSubmit}
          buttonLabel="Add Grocery"
          heading="Add New Grocery"
          successMessage="Grocery added successfully!"
        />
      )}
    </Box>
  );
};

export default NewGroceryPage;