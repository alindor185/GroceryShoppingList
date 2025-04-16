import React, { useState, useEffect } from "react";
import { useParams, Link as RouteLink } from 'react-router-dom'
import { axiosInstance } from '../../api/axios';
import {
    Card,
    CardBody,
    Heading,
    Avatar,
    Text,
    Divider,
    HStack,
    Flex,
    useToast,
    Editable,
    Tag,
    EditablePreview,
    EditableInput,
    Link,
    Spinner,
    useColorModeValue,
    IconButton,
    useClipboard,
    Button,
    VStack,
    Box,
    Image,
    FormControl,
    FormLabel,
    Switch,
    useDisclosure,
    FormHelperText,
    
} from "@chakra-ui/react";
import { SearchItem } from "./SearchItem";
import GroceryItemList from "./GroceryItemList";
import { HistoryLog } from "./HistoryLog";
import { ArrowForwardIcon, CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { ListSettings } from "./ListSettings";
import { CompleteListModal } from "./CompleteListModal";
import RecommendedItems from "./RecommendedItems";

export const ViewList = () => {
    const { listId } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [listData, setListData] = useState(null);
    const [groceryItems, setGroceryItems] = useState([]);
    const [suggestedGroceries, setSuggestedGroceries] = useState([]);
    const { onCopy, value: code , setValue: setCode, hasCopied } = useClipboard('')
    const { 
        isOpen: isCompleteModalOpen,
        onOpen: onCompleteModalOpen,
        onClose: onCompleteModalClose
    } = useDisclosure()
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    const hasAllItemsPurchesed = groceryItems?.every((item) => item.purchased == true) ;
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

    const updateList = async (data) => {
        try {
            const result = await axiosInstance.put(`/lists/${listId}`, {
                ...data
            });
            setSettings(result?.data?.list?.settings || {});
        } catch(error) {
            alert("Error while updating list")
            console.error("Error while updating list", error)
        }
    };

    const updateSettings = async (type, value) => {
        setSettingValue(type, value);
        await updateList({ settings: { ...settings, [type]: value } });
    }

    // Add item to the grocery list
    const addItem = async (item) => {
        try {
            const { name, baseProductImageSmall, secondLevelCategory, categoryPrice } = item;
            const { data } = await axiosInstance.post(`/lists/${listId}/add-item`, {
                name,
                quantity: 1,
                imageUrl: baseProductImageSmall,
                category: secondLevelCategory,
                formattedPrice: categoryPrice?.formattedValue || "",
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
            const isLastNonPurchaseItem = groceryItems.filter((item) => item.purchased === false).length === 1;

            await axiosInstance.put(`/lists/${listId}/items/${id}/purchased`);
            setGroceryItems(
                groceryItems.map((item) =>
                    item._id === id ? { ...item, purchased: true } : item
            ));
            if (isLastNonPurchaseItem) {
                onCompleteModalOpen();
            }

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

    return (
        <Card p={4} boxShadow="lg" flex="1" onClick={() => setSuggestedGroceries([])} minHeight="90vh">
            {loading ? (
                <CardBody justifyContent="center" alignItems="center" display="flex" flex="1">
                    <Spinner size="xl" />
                </CardBody>
            ) : <CardBody>
                <RouteLink to="/"><Link>  <ArrowForwardIcon /> חזור לעמוד הראשי </Link> </RouteLink>
                <Flex gap={4} height="100%">
                    <CompleteListModal isOpen={isCompleteModalOpen} onClose={onCompleteModalClose} />
                    <VStack flex={2} p={4} gap="2" alignItems="start" width="100%" >
                        <HStack alignItems="center" p={4}>
                            <Avatar name={listData.name} src={listData.imageUrl} size="md" />
                            <Heading size="lg" mb={2}>
                                <Editable defaultValue={listData?.name} >
                                    <EditablePreview />
                                    <EditableInput />
                                </Editable>
                            </Heading>
                            {listData.isArchived && <Tag colorScheme="gray" size="sm">
                            בארכיון
                            </Tag>}
                        </HStack>

                        <SearchItem
                            addItem={addItem}
                            searchQuery={searchQuery}
                            setSuggestedGroceries={setSuggestedGroceries}
                            suggestedGroceries={suggestedGroceries}
                            setSearchQuery={setSearchQuery}
                        />

                        {hasAllItemsPurchesed && !listData?.isArchived &&
                         <Button onClick={onCompleteModalOpen} width="100%" mb={3}> העבר רשימה לארכיון ✅ </Button>
                         }
                        <GroceryItemList
                            isAssign={settings?.assignItems}
                            deleteItem={deleteItem}
                            groceryItems={groceryItems}
                            setGroceryItems={setGroceryItems}
                            changeQuantity={changeQuantity}
                            markAsPurchased={markAsPurchased}
                            users={listData?.members}
                            listId={listData?._id}
                        />

                        <RecommendedItems 
                            listId={listId} 
                            onAddItem={(item) => {
                                setGroceryItems([...groceryItems, item]);
                            }}
                            refreshTrigger={groceryItems.length} 
                        />
                    </VStack>

                    {/* Divider */}
                    <Divider orientation="vertical" borderLeft="1px" color={bgHoverColor}/>

                    <ListSettings 
                        updateSettings={updateSettings}
                        members={listData?.members} 
                        code={code} 
                        onCopy={onCopy} 
                        settings={settings} 
                        admin={listData.admin}
                        hasCopied={hasCopied}
                        isArchived={listData.isArchived}
                    />
                </Flex>
            </CardBody>}
        </Card>
    );
};