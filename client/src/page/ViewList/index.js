import React, { useState, useEffect } from "react";
import { useParams, Link as RouteLink } from 'react-router-dom'
import { axiosInstance } from '../../api/axios';
import {
    Box,
    Card,
    CardBody,
    Heading,
    List,
    ListItem,
    Avatar,
    Text,
    Divider,
    HStack,
    Flex,
    useToast,
    Editable,
    EditablePreview,
    EditableInput,
    Link,
    Spinner,
    useColorModeValue,
    IconButton,
    useClipboard,
    VStack,
    FormControl,
    FormLabel,
    Switch,
    FormHelperText,
} from "@chakra-ui/react";
import { SearchItem } from "./SearchItem";
import GroceryItemList from "./GroceryItemList";
import { ArrowForwardIcon, CheckIcon, CopyIcon } from "@chakra-ui/icons";


export const ViewList = () => {
    const { listId } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [listData, setListData] = useState(null);
    const [groceryItems, setGroceryItems] = useState([]);
    const [suggestedGroceries, setSuggestedGroceries] = useState([]);
    const { onCopy, value: code , setValue: setCode, hasCopied } = useClipboard('')
    const bgHoverColor = useColorModeValue("gray.300", "gray.900");
    const [settings, setSettings] = useState({
        continious: false,
        assignItems: false
    })

    const toast = useToast();

    const setSettingValue = (type, value) => {
        setSettings({
            ...settings,
            [type]: value
        })
    }
    useEffect(() => {
        axiosInstance.get(`/lists/${listId}/details`)
            .then(({ data }) => {
                console.log("list data", data);
                if (data?.list.settings) setSettings(data?.list.settings)
                setListData(data?.list || {});
                setGroceryItems(data?.list.items);
                setCode(data?.list.joinCode)
                console.log('data?.list', data?.list.settings)
            }).catch((err) => {
                alert("Error while fetching list data")
                console.log(err)
            }).finally(() => {
                setLoading(false);
            })
    }, [listId])



    // Add item to the grocery list
    const addItem = async (item) => {
        try {
            const { name, baseProductImageSmall, secondLevelCategory, categoryPrice } = item;
            // ?.formattedValue
            const { data } = await axiosInstance.post(`/lists/${listId}/add-item`, {
                name,
                quantity: 1,
                imageUrl: baseProductImageSmall,
                category: secondLevelCategory,
                formattedPrice: categoryPrice.formattedValue,
            });
            setGroceryItems([...groceryItems, { ...data?.item, assignedTo: "", purchased: false }]);
            setSearchQuery(""); // Clear search
        } catch(error) {
            alert("Error while adding item to the list")
            console.error("Error while adding item to the list", error)
        }
    };

    // Delete an item from the list
    const deleteItem = async (id) => {
        try {
            await axiosInstance.delete(`/lists/${listId}/items/${id}`);
            setGroceryItems(groceryItems.filter((item) => item._id !== id));
        } catch(error) {
            alert("Error while deleting item from the list")
            console.error("Error deleting item", error)
        }
    };

    const changeQuantity = async (id, quantity) => {
        try {
            const { data } = await axiosInstance.put(`/lists/${listId}/items/${id}`, { quantity });
            setGroceryItems(
                groceryItems.map((item) =>
                    item._id === id ? { ...item, quantity: data.item.quantity } : item
                )
            );
        } catch(error) {
            alert("Error while changing item quantity")
            console.error("Error changing item quantity", error)
        }
    }
    // Mark an item as purchased
    const markAsPurchased = async (id) => {
        try {

            await axiosInstance.put(`/lists/${listId}/items/${id}/purchased`);
            setGroceryItems(
                groceryItems.map((item) =>
                    item._id === id ? { ...item, purchased: true } : item
            )
        );
        toast({
            title: "Item marked as purchased!",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    } catch (error) {
        alert("Error while marking item as purchased")
        console.error("Error marking item as purchased", error)
    }
    };

    console.log('settings', settings)

    return (
        <Card p={4} boxShadow="lg" flex="1" onClick={() => setSuggestedGroceries([])} minHeight="90vh">
            {loading ? (
                <CardBody justifyContent="center" alignItems="center" display="flex" flex="1">
                    <Spinner size="xl" />
                </CardBody>
            ) : <CardBody>
                <RouteLink to="/"><Link>  <ArrowForwardIcon /> חזור לעמוד הראשי </Link></RouteLink>
                <Flex  gap={4} height="100%">
                    <VStack flex={2} p={4} gap="2" alignItems="start" width="100%" >
                        <HStack alignItems="center" p={4}>
                            <Avatar name={listData.name} src={listData.imageUrl} size="md" />
                            <Heading size="lg" mb={2}>
                                <Editable defaultValue={listData?.name} >
                                    <EditablePreview />
                                    <EditableInput />
                                </Editable>
                            </Heading>
                        </HStack>

                        <SearchItem
                            addItem={addItem}
                            searchQuery={searchQuery}
                            setSuggestedGroceries={setSuggestedGroceries}
                            suggestedGroceries={suggestedGroceries}
                            setSearchQuery={setSearchQuery}
                        />

                        <GroceryItemList
                            deleteItem={deleteItem}
                            groceryItems={groceryItems}
                            setGroceryItems={setGroceryItems}
                            changeQuantity={changeQuantity}
                            markAsPurchased={markAsPurchased}
                        />
                    </VStack>

                    {/* Divider */}
                    <Divider orientation="vertical" borderLeft="1px" color={bgHoverColor}/>

                    <VStack flex="1" alignItems="start">

                        <Box  p={4} width="100%">
                            <Heading size="md" mb={4}>חברים ברשימה</Heading>
                            <List spacing={2}>
                                {listData?.members.map((person) => (
                                    <ListItem key={person._id}>
                                        <HStack>
                                            <Avatar size="sm" src={person.image}  border/>
                                            <Text>{person.fullName || person.email}</Text>

                                            {person._id === listData?.admin && <Text color="gray.500">(מנהל/ת הרשימה)</Text>}
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>

                            <VStack mt={6} p={4} border="1px dashed gray" textAlign="center" borderRadius="md" justifyItems="center">
                                <Text fontWeight="bold">קוד הזמנה</Text>
                                <HStack justifyContent="center" gap="1">
                                    <IconButton onClick={onCopy} size="sm" variant="ghost">
                                        {hasCopied ? <CheckIcon/> : <CopyIcon/>}
                                    </IconButton>
                                    <Text fontSize="2xl" color="green.500" letterSpacing="widest">{code}</Text>
                                </HStack>
                            </VStack>
                        </Box>
                        <VStack  p={4}>

                        <Heading size="md" mb={4}>הגדרות רשימה</Heading>

                            <FormControl  display='flex' justifyContent='center' flexDirection="column" onChange={(e)=> setSettingValue('continious', e.target.checked)}>
                                <HStack>
                                <FormLabel htmlFor='continious' mb='0'>
                                    רשימה רב פעמית
                                </FormLabel>
                                <Switch id='continious' isChecked={settings.continious}/>
                                </HStack>
                                <FormHelperText>
                                    ברשימה רב פעמית, לאחר שכל המוצרים ברשימה יירכשו, יהיה ניתן לאתחל את הרשימה מחדש ולקבל עבורה המלצות למוצרים על סמך ההיסטוריה.
                                </FormHelperText>
                            </FormControl>
                            <FormControl display='flex' justifyContent='center' flexDirection="column" onChange={(e)=> setSettingValue('assignItems', e.target.checked)}>
                                <HStack>
                                <FormLabel htmlFor='assign' mb='0'>
                                    שיוך מוצרים למשתמשים
                                </FormLabel>
                                <Switch id='assign' isChecked={settings.assignItems} />
                                </HStack>
                                <FormHelperText>
                                   הגדרה זו מאפשרת למשתמשים להשתבץ למוצרים שונים.
                                </FormHelperText>
                            </FormControl>
                        </VStack>
                    </VStack>
                </Flex>
            </CardBody>}
        </Card>
    );
};
