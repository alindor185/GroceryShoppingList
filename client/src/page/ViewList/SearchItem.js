import React, { useCallback } from "react";
import {
    Box,
    Input,
    Text,
    Tag,
    Flex,
    Image,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { GroceriesAPI } from "../../api/groceries";
import { getCategoryColor } from "./categories";

export const SearchItem = ({ suggestedGroceries, setSuggestedGroceries, addItem, searchQuery, setSearchQuery }) => {
    const debouncedFetch = useCallback(
        debounce(async (searchTerm) => {
          const results = await GroceriesAPI.searchGroceryByText(searchTerm)
          setSuggestedGroceries(results);
        }, 300), // 300ms delay
        []
      );

    const searchGroceryByText = async (searchQuery) => {
        try {
            setSearchQuery(searchQuery)
            if (!searchQuery) {
                setSuggestedGroceries([]);
                return;
            }
            debouncedFetch(searchQuery);
        }
        catch (error) {
            console.error("Error while fetching grocery items", error)
        }
    }

    return (
        <Box mb={4} position="relative" width="100%">
        <Input
            placeholder="חפש והוסף פריט..."
            value={searchQuery}
            onChange={(e) => searchGroceryByText(e.target.value)}
            type="search"
        />

        {suggestedGroceries.length > 0 && (
            <Box
                position="absolute"
                width="100%"
                bg="white"
                boxShadow="md"
                zIndex="10"
                mt={1}
                borderRadius="md"
            >
                {suggestedGroceries.map((item) => (
                    <Box
                        key={item.code}
                        p={3}
                        borderBottom="1px solid #ddd"
                        cursor="pointer"
                        _hover={{ bg: "gray.100" }}
                        onClick={() => addItem(item)}
                    >
                        <Flex align="center" gap={3}>
                            <Image
                                src={item.baseProductImageSmall}
                                alt={item.name}
                                boxSize="50px"
                                borderRadius="md"
                                objectFit="cover"
                            />

                            <Box flex="1">
                                <Text fontWeight="bold">{item.name}</Text>
                                <Text fontSize="sm" color="gray.500">
                                    מחיר ממוצע ~{item.categoryPrice?.formattedValue}
                                </Text>
                            </Box>

                            <Tag colorScheme={getCategoryColor(item.secondLevelCategory)} size="sm">
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
