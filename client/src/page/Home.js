import React, { useEffect } from 'react';
import { Lists } from './components/Lists';
import {
  Box,
  Image,
  Text,
  Flex,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

import { axiosInstance } from '../api/axios';

export const Home = () => {
  const [topItems, setTopItems] = React.useState([]);
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    axiosInstance
      .get('/lists/top_items')
      .then((res) => {
        console.log('popular', res.data?.topItems);
        setTopItems(res.data?.topItems);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Flex justifyContent="center" gap={6} flexWrap="wrap">
      <Lists />
      <Lists isArchivedLists />

      <Box w="100%" p={4}>
        <Heading mb={6}>המוצרים שנרכשו הכי הרבה במערכת</Heading>
        <Flex overflowX="auto" pb={4}>
          {topItems.map(({ item, purchaseCount }) => (
            <Box
              key={item._id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              bg={bg}
              borderColor={borderColor}
              minWidth="250px"
              mr={4}
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                boxSize="150px"
                objectFit="cover"
                mx="auto"
                mb={4}
              />
              <Text fontWeight="bold" fontSize="lg" mb={1}>
                {item.name}
              </Text>
              <Text color="gray.500" mb={3}>
                {item.category}
              </Text>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold">
                  {item.formattedPrice}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  נרכש {purchaseCount} פעמים
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};
