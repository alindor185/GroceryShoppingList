import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Image,
  Spinner,
  useToast,
  Flex,
  Tag,
  useColorModeValue
} from "@chakra-ui/react";
import { axiosInstance } from "../../api/axios";

export const RecommendedItems = ({ listId, onItemAdded }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await axiosInstance.get(`/recommendations?listId=${listId}`);
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations", error);
        toast({ title: "שגיאה בטעינת המלצות", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [listId, toast]);

  const addItem = async (item) => {
    try {
      const { data } = await axiosInstance.post("/recommendations/add-to-list", {
        listId,
        itemName: item.itemName,
        category: item.category,
        imageUrl: item.imageUrl,
      });
      toast({ title: "המוצר נוסף לרשימה", status: "success" });
      if (onItemAdded) onItemAdded(data.item);
    } catch (error) {
      toast({ title: "שגיאה בהוספה לרשימה", status: "error" });
      console.error("Error adding item", error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (recommendations.length === 0) {
    return <Text>אין המלצות זמינות כרגע.</Text>;
  }

  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>מומלץ להוסיף:</Heading>
      <Flex overflowX="auto" gap={4} pb={2}>
        {recommendations.map((item) => (
          <Box
            key={item._id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            bg={bg}
            borderColor={borderColor}
            minW="250px"
          >
            <Image
              src={item.imageUrl}
              alt={item.itemName}
              boxSize="100px"
              objectFit="cover"
              mx="auto"
              mb={3}
            />
            <Text fontWeight="bold">{item.itemName}</Text>
            <Text color="gray.500">{item.category}</Text>
            <Tag colorScheme="green" size="sm" mt={1}>המלצה</Tag>
            <Button mt={3} size="sm" colorScheme="green" onClick={() => addItem(item)}>
              הוסף לרשימה
            </Button>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
