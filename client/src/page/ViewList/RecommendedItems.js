import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  List,
  ListItem,
  Spinner,
  Tag,
  Text,
  useColorModeValue,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from '@chakra-ui/icons';
import { axiosInstance } from '../../api/axios';
import { getCategoryColor } from "./categories";

const RecommendedItems = ({ listId, onAddItem, refreshTrigger }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState({});
  const toast = useToast();
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  // Fetch recommendations when component mounts or listId changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/lists/${listId}/recommendations`);
        console.log("Recommendations data:", response.data);
        
        // Get recommendations data
        const recommendationsData = response.data?.recommendations || [];
        
        // Filter out duplicates based on item name
        const uniqueRecommendations = removeDuplicateRecommendations(recommendationsData);
        
        setRecommendations(uniqueRecommendations);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        toast({
          title: "שגיאה בטעינת המלצות",
          description: "לא הצלחנו לטעון את המלצות המוצרים",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchRecommendations();
    }
  }, [listId, refreshTrigger, toast]);

  // Helper function to remove duplicates from recommendations
  const removeDuplicateRecommendations = (recommendations) => {
    const seen = new Set();
    return recommendations.filter(rec => {
      // Extract the item name (handle both direct and nested structure)
      const itemName = rec.item?.name || rec.itemName;
      
      // If we've seen this name before, filter it out
      if (seen.has(itemName)) {
        return false;
      }
      
      // Otherwise, add to seen set and keep this item
      seen.add(itemName);
      return true;
    });
  };

  const handleAddToList = async (recommendation) => {
    setAdding(prev => ({ ...prev, [recommendation._id]: true }));
    
    try {
      // Use the same endpoint your ViewList component uses for adding items
      const { data } = await axiosInstance.post(`/lists/${listId}/add-item`, {
        name: recommendation.item?.name || recommendation.itemName,
        quantity: 1,
        imageUrl: recommendation.item?.imageUrl || recommendation.imageUrl,
        category: recommendation.item?.category || recommendation.category,
        formattedPrice: recommendation.item?.formattedPrice || "",
      });
      
      // Remove from recommendations list
      setRecommendations(prev => 
        prev.filter(item => item._id !== recommendation._id)
      );
      
      // Notify parent component to refresh items list
      if (onAddItem && data?.item) {
        onAddItem({ ...data.item, assignedTo: "", purchased: false });
      }
      
      toast({
        title: "מוצר נוסף",
        description: `${recommendation.item?.name || recommendation.itemName} נוסף לרשימה`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to add item:", error);
      toast({
        title: "שגיאה בהוספת פריט",
        description: "לא הצלחנו להוסיף את הפריט לרשימה",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAdding(prev => ({ ...prev, [recommendation._id]: false }));
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="lg" color="blue.500" />
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show anything when there are no recommendations
  }

  return (
    <Box mb={8} width="100%">
      <Heading size="md" mb={4} color={headingColor}>
        אולי תרצה להוסיף
      </Heading>
      <List spacing={3} width="100%">
        {recommendations.map((rec) => {
          // The item might be nested inside a "item" property or directly in the recommendation
          const item = rec.item || rec;
          const itemId = rec._id || item._id;
          const itemName = item.name || rec.itemName;
          const itemCategory = item.category || rec.category;
          const itemImage = item.imageUrl || rec.imageUrl;
          const frequency = item.frequency || rec.frequency || "7"; // Default to 7 if undefined
          const dueInDays = item.dueInDays ?? rec.dueInDays ?? 0;

          return (
            <ListItem
              key={itemId}
              p={4}
              bg={cardBg}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              boxShadow="sm"
              _hover={{ boxShadow: "md", bg: hoverBg }}
              transition="0.2s"
            >
              <Flex align="center" justify="space-between" wrap="wrap">
                {/* Left: Image + Info */}
                <HStack spacing={4} flex="1" minW="0">
                  <Image
                    src={itemImage}
                    alt={itemName}
                    boxSize="50px"
                    borderRadius="lg"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/50"
                  />
                  <VStack align="start" spacing={1} minW="0">
                    <HStack flexWrap="wrap" spacing={2}>
                      <Text
                        fontWeight="bold"
                        isTruncated
                        maxW="200px"
                      >
                        {itemName}
                      </Text>
                      {itemCategory && (
                        <Tag colorScheme={getCategoryColor(itemCategory)} size="sm">
                          {itemCategory}
                        </Tag>
                      )}
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.500">
                      {dueInDays === 0 
                        ? "הזמן לקנות עכשיו" 
                        : `נקנה בדרך כלל כל ${frequency} ימים`}
                    </Text>
                  </VStack>
                </HStack>

                {/* Right: Add button */}
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleAddToList(rec)}
                  isLoading={adding[itemId]}
                  ml={2}
                >
                  הוסף
                </Button>
              </Flex>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default RecommendedItems;