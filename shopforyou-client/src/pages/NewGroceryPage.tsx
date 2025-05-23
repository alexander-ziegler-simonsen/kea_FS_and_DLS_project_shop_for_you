import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import GroceryForm from '../forms/GroceryForm';
import { Box, Spinner } from "@chakra-ui/react";
import ApiClient from '../services/grocery-api-client';

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

  const categoryApi = new ApiClient<any>('/api/categories');
  const groceryApi = new ApiClient<any>('/api/groceries');
  const uploadApi = new ApiClient<any>('/api');

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
    setIsError(false);
    setError(null);
    try {
      const response = await categoryApi.getAll();
      let cats: Category[] = [];
      if (Array.isArray(response)) {
        cats = response;
      } else if (Array.isArray((response as any)?.categories)) {
        cats = (response as any).categories;
      } else if (Array.isArray((response as any)?.results)) {
        cats = (response as any).results;
      }
      setCategories(cats);
    } catch (error) {
      setCategories([]);
      setIsError(true);
      setError(error);
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
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
        const serverResponse = await uploadApi.uploadFormData("/upload-to-imgur", imageFormData);
        imageUrl = serverResponse.link;
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
      type: values.categoryIds, // now an array
      price: values.price,
      description: values.description,
      amount: values.amount,
      image: imageUrl,
    };

    try {
      await groceryApi.post(groceryData);
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
            categoryIds: [], // changed from categoryId: ''
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