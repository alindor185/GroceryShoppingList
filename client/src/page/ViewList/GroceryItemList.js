import React from 'react';
import {
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  List,
  ListItem,
  Select,
  Tag,
  Text,
  useColorModeValue,
  VStack,
  Box,
} from "@chakra-ui/react";
import { getCategoryColor } from "./categories";
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import {axiosInstance} from '../../api/axios';
import HistoryLog from './HistoryLog';
import {UserDropdown} from './SelectUser';

const sortByPurchased = (items = []) => [...items].sort((a, b) => Number(a.purchased) - Number(b.purchased));

export const GroceryItemList = ({
  groceryItems,
  setGroceryItems,
  markAsPurchased,
  deleteItem,
  changeQuantity,
  isAssign,
  listId,
  users,
}) => {
  const bgHoverColor = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const onAssigneeChange = async (item, assignee) => {
    try { 
      setGroceryItems(
        groceryItems.map((i) => (i._id === item._id ? { ...i, assignee } : i))
      );
      const { data } = await axiosInstance.put(`/items/${item?._id}`, {
        assignee: assignee?._id,
      });
    } catch(e) {
      console.log("Failed to change assignee",e);
      
    }
  }

  return (
    <>
      <List spacing={5} width="100%">
        {sortByPurchased(groceryItems).map((item) => (
          <ListItem
            key={item._id}
            p={5}
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            _hover={{ boxShadow: "md", transform: "scale(1.01)", transition: "0.2s" }}
            transition="0.2s"
          >
            <Flex align="center" gap={6} justify="space-between" wrap="wrap">
              {/* Left: Image + Info */}
              <HStack spacing={4} flex="1" minW="0">
              {!item.purchased && <IconButton
                  onClick={() => deleteItem(item._id)}
                  size="sm"
                  colorScheme="red"
                  aria-label="delete_item"
                  icon={<DeleteIcon />}
                />}
                <HStack spacing={1}>
                  {!item.purchased && <Button
                    variant="ghost"
                    size="xs"
                    fontSize="xl"
                    onClick={() => changeQuantity(item._id, item.quantity - 1)}
                    isDisabled={item.quantity <= 1}
                  >
                    -
                  </Button>}
                  <Text fontWeight="bold" fontSize="lg">{item.quantity || 1}</Text>
                  {!item.purchased && <Button
                    fontSize="xl"
                    size="xs"
                    variant="ghost"
                    onClick={() => changeQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </Button>}
                </HStack>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  boxSize="55px"
                  borderRadius="lg"
                  objectFit="cover"
                />
                <VStack align="start" spacing={1} minW="0">
                  <HStack flexWrap="wrap" spacing={2}>
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      isTruncated
                      maxW="200px"
                      textDecoration={item.purchased ? "line-through" : "none"}
                    >
                      {item.name}
                    </Text>
                    <Tag colorScheme={getCategoryColor(item.category)} size="sm">
                      {item.category}
                    </Tag>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    מחיר ממוצע ~ {item.formattedPrice}
                  </Text>
                </VStack>
              </HStack>

              {/* Right: Actions */}
              <HStack spacing={3}>
               {/* {isAssign && <Select
                  placeholder="הקצה לאדם"
                  size="sm"
                  value={item.assignedTo?.fullName || || ""}
                  onChange={(e) =>
                    setGroceryItems(
                      groceryItems.map((i) =>
                        i._id === item._id ? { ...i, assignedTo: e.target.value } : i
                      )
                    )
                  }
                  w="130px"
                  bg="white"
                  borderRadius="md"
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </Select>} */}

                {isAssign && !item.purchased &&  <UserDropdown users={users} selectedUser={item.assignee} 
                 onSelect={(user) => onAssigneeChange(item, user)}
                />}

                {!item.purchased && (
                  <IconButton
                    onClick={() => markAsPurchased(item._id)}
                    size="sm"
                    colorScheme="green"
                    aria-label="check_item"
                    icon={<CheckIcon />}
                  />
                )}
              </HStack>
            </Flex>
          </ListItem>
        ))}
      </List>

    </>
  );
};

export default GroceryItemList;
