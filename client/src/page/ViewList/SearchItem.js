import React, { useCallback } from "react";
import {
  Box,
  Input,
  Text,
  Tag,
  Flex,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { GroceriesAPI } from "../../api/groceries";
import { getCategoryColor } from "./categories";

export const SearchItem = ({
  suggestedGroceries,
  setSuggestedGroceries,
  addItem,
  searchQuery,
  setSearchQuery,
}) => {
  const inputBg = useColorModeValue("white", "gray.700");
  const dropdownBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const debouncedFetch = useCallback(
    debounce(async (searchTerm) => {
      const results = await GroceriesAPI.searchGroceryByText(searchTerm);
      setSuggestedGroceries(results);
    }, 300),
    []
  );

  const searchGroceryByText = async (searchQuery) => {
    try {
      setSearchQuery(searchQuery);
      if (!searchQuery) {
        setSuggestedGroceries([]);
        return;
      }
      debouncedFetch(searchQuery);
    } catch (error) {
      console.error("Error while fetching grocery items", error);
    }
  };

  return (
    <Box mb={6} position="relative" width="100%">
      <Input
        placeholder="חפש והוסף פריט..."
        value={searchQuery}
        onChange={(e) => searchGroceryByText(e.target.value)}
        type="search"
        bg={inputBg}
        borderRadius="xl"
        boxShadow="sm"
        _focus={{ boxShadow: "md", borderColor: "primary.500" }}
        px={4}
        py={6}
        fontSize="md"
      />

      {suggestedGroceries && suggestedGroceries.length > 0 && (
        <Box
          position="absolute"
          width="100%"
          bg={dropdownBg}
          boxShadow="xl"
          zIndex="10"
          mt={2}
          borderRadius="xl"
          overflow="hidden"
        >
          {suggestedGroceries.map((item) => (
            <Box
              key={item.code}
              px={4}
              py={3}
              borderBottom="1px solid"
              borderColor="gray.100"
              cursor="pointer"
              _hover={{ bg: hoverBg }}
              onClick={() => addItem(item)}
              transition="0.2s"
            >
              <Flex align="center" gap={4}>
                <Image
                  src={item.baseProductImageSmall}
                  alt={item.name}
                  boxSize="50px"
                  borderRadius="md"
                  objectFit="cover"
                />

                <Box flex="1">
                  <Text fontWeight="bold" noOfLines={1}>
                    {item.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    מחיר ממוצע ~ {item.categoryPrice?.formattedValue}
                  </Text>
                </Box>

                <Tag
                  colorScheme={getCategoryColor(item.secondLevelCategory)}
                  size="sm"
                  variant="subtle"
                  borderRadius="md"
                >
                  {item.secondLevelCategory}
                </Tag>
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
