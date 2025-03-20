import {
  Button,
  CheckboxIcon,
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
} from "@chakra-ui/react";
import { getCategoryColor } from "./categories";
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';

const sortByPurchased = (items = []) => [...items].sort((a, b) => Number(a.purchased) - Number(b.purchased));

export const GroceryItemList = ({ groceryItems, setGroceryItems, markAsPurchased, deleteItem, changeQuantity }) => {
    const bgHoverColor = useColorModeValue("gray.200", "gray.800");

  return (
    <List spacing={4} width="100%">
      {sortByPurchased(groceryItems).map((item) => (
        <ListItem
          key={item._id}
          p={4}
          borderBottom="1px solid #ddd"
          borderColor={bgHoverColor}
          cursor="pointer"
          _hover={{ bg: bgHoverColor}}
        >
          <Flex align="center" gap={4} justify="space-between">

            {/* Left Section: Item Image & Info */}
            <HStack spacing={4}>


              <IconButton
                onClick={() => deleteItem(item._id)}
                size="sm"
                colorScheme='red'
                aria-label='delete_item'
                icon={<DeleteIcon />}
              />
              {/* Quantity Controls */}
              <HStack gap="1">
                <Button
                  variant="ghost"
                  size="xs"
                  fontSize="xl"
                  onClick={() => changeQuantity(item._id, item.quantity - 1)}
                  isDisabled={item.quantity <= 1}
                >
                  -
                </Button>
                <Text textAlign="center" fontWeight="bold">{item.quantity || 1}</Text>
                <Button fontSize="xl"
                  size="xs" variant="ghost"
                  onClick={() => changeQuantity(item._id, item.quantity + 1)}
                >
                  +
                </Button>
              </HStack>


              <Image
                src={item.imageUrl}
                alt={item.name}
                boxSize="50px"
                borderRadius="md"
                objectFit="cover"
              />
              <VStack align="start" spacing={0}>
                <HStack flexWrap="wrap-reverse">

                  <Text fontWeight="bold" textDecoration={item.purchased ? "line-through" : "none"}>{item.name} </Text>
                  <Tag colorScheme={getCategoryColor(item.category)} size="sm">
                    {item.category}
                  </Tag>
                </HStack>

                <Text fontSize="sm" color="gray.500">
                  מחיר ממוצע ~{item.formattedPrice}
                </Text>
              </VStack>
            </HStack>

            {/* Right Section: Actions */}
            <HStack spacing={3}>
              {/* Assign to Person */}
              <Select
                placeholder="הקצה לאדם"
                size="sm"
                value={item.assignedTo || ""}
                onChange={(e) =>
                  setGroceryItems(
                    groceryItems.map((i) =>
                      i._id === item._id ? { ...i, assignedTo: e.target.value } : i
                    )
                  )
                }
                w="120px"
              >
                {/* {people.map((person, index) => (
                    <option key={index} value={person}>{person}</option>
                  ))} */}
              </Select>

             {!item.purchased &&  <IconButton
                onClick={() => markAsPurchased(item._id)}
                size="sm"
                colorScheme='green'
                aria-label='check_item'
                icon={<CheckIcon />}
              />}
            </HStack>
          </Flex>
        </ListItem>
      ))}
    </List>
  );
};

export default GroceryItemList;
