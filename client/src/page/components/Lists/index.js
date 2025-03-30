import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Button,
  Text,
  List,
  ListItem,
  Avatar,
  HStack,
  Heading,
  Flex,
  Progress,
  Stack,
  Skeleton,
  VStack,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../api/axios";
import { JoinListButton } from "../JoinListButton";
import Basket from './grocery-basket.png'
import { CreateListButton } from "../CreateListButton";

export const Lists = ({ isArchivedLists }) => {
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState([]);
  const navigate = useNavigate();
  const bgHoverColor = useColorModeValue("gray.200", "gray.800");

  useEffect(() => {
    axiosInstance
      .get("/lists", { params: isArchivedLists ? { archived: isArchivedLists } : {}})
      .then((res) => {
        console.log("res", res);
        setLists(res.data?.lists || []);
        setLoading(false)
      })
      .catch((err) => {
        console.log(err);
        setLoading(false)
      });
  }, []);

  const addListToCurrentLists = (list) => {
    setLists([...lists, list]);
  }

  return (
    <Card p={4} boxShadow="lg" minW="600px" flex="1" mx="auto">
      <CardBody>
        {/* Header with Title and Button */}
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h3" size="lg">
            {isArchivedLists ? "הרשימות שבארכיון" : "רשימות פעילות"}
          </Heading>
          {!isArchivedLists && <CreateListButton onSuccess={addListToCurrentLists} />}
        </Flex>

        {/* Scrollable List Container */}
        <Box maxH="400px" overflowY="auto" pr={2}>
          <List spacing={4}>
            {loading ? <Stack>
              <Skeleton height='20px' />
              <Skeleton height='20px' />
              <Skeleton height='20px' />
            </Stack>
            : !lists.length ?
             <VStack spacing={4}>
              <Image src={Basket} width={20} />
            <Text fontSize="xl">אין רשימות להציג</Text>
            {!isArchivedLists && <JoinListButton buttonProps={{ variant: "outline"}} addListToCurrentLists={addListToCurrentLists} />}
          </VStack>
         : lists.map((list, index) => {
              // Mock progress calculation (random for now)
              const totalItems = list.items.length;
              const totalPurchasedItems = list.items.filter((item) => item.purchased).length; 
              const progress = totalItems ? Math.floor((totalPurchasedItems / totalItems) * 100) : 0;

              return (
                <ListItem
                  key={index}
                  display="flex"
                  flexDirection="column"
                  alignItems="stretch"
                  p={2}
                  borderRadius="md"
                  _hover={{ backgroundColor: bgHoverColor}}
                >
                  <HStack justifyContent="space-between">
                    <HStack spacing={4}>
                      <Avatar name={list.name} src={list.imageUrl} size="md" />
                      <Box>
                        <Text fontWeight="bold">{list.name}</Text>
                        {list.description && (
                          <Text fontSize="sm" color="gray.600">
                            {list.description}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    <Button size="sm" variant="ghost" onClick={() => navigate(`/list/${list._id}`)}>
                      צפייה
                    </Button>
                  </HStack>

                  <Box mt={2}>
                    <Progress value={progress} size="sm" colorScheme="green" borderRadius="md" />
                    <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                      {progress}% הושלם
                    </Text>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Box>
         {!isArchivedLists && lists?.length > 0 &&  <JoinListButton buttonProps={{ width: "100%", variant: "outline", margin:"3" }} addListToCurrentLists={addListToCurrentLists} />}
      </CardBody>
    </Card>
  );
};
