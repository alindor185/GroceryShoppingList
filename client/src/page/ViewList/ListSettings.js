import React from "react";
import { useParams } from 'react-router-dom'
import { axiosInstance } from '../../api/axios';
import {
    Box,
    ListItem,
    Avatar,
    Text,
    HStack,
    Heading,
    List,
    IconButton,
    VStack,
    FormControl,
    FormLabel,
    Switch,
    FormHelperText,
} from "@chakra-ui/react";
import { HistoryLog } from "./HistoryLog";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";


export const ListSettings = ({ isArchived, members, code, onCopy, settings, admin, hasCopied, updateSettings }) => {
    const { listId } = useParams();

    return (

        <VStack flex="1" alignItems="start">

            <Box p={4} width="100%">
                <Heading size="md" mb={4}>חברים ברשימה</Heading>
                <List spacing={2}>
                    {members.map((person) => (
                        <ListItem key={person._id}>
                            <HStack>
                                <Avatar size="sm" src={person.image} border />
                                <Text>{person.fullName || person.email}</Text>
                                {person._id === admin && <Text color="gray.500">(מנהל/ת הרשימה)</Text>}
                            </HStack>
                        </ListItem>
                    ))}
                </List>

                {!isArchived && <VStack mt={6} p={4} border="1px dashed gray" textAlign="center" borderRadius="md" justifyItems="center">
                    <Text fontWeight="bold">קוד הזמנה</Text>
                    <HStack justifyContent="center" gap="1">
                        <IconButton onClick={onCopy} size="sm" variant="ghost">
                            {hasCopied ? <CheckIcon /> : <CopyIcon />}
                        </IconButton>
                        <Text fontSize="2xl" color="green.500" letterSpacing="widest">{code}</Text>
                    </HStack>
                </VStack>}
            </Box>
             {!isArchived && <VStack p={4}>
                <Heading size="md" mb={4}>הגדרות רשימה</Heading>

                <FormControl display='flex' justifyContent='center' flexDirection="column" onChange={(e) => updateSettings('continious', e.target.checked)}>
                    <HStack>
                        <FormLabel htmlFor='continious' mb='0'>
                            רשימה רב פעמית
                        </FormLabel>
                        <Switch id='continious' isChecked={settings.continious} />
                    </HStack>
                    <FormHelperText>
                        ברשימה רב פעמית, לאחר שכל המוצרים ברשימה יירכשו, יהיה ניתן לאתחל את הרשימה מחדש ולקבל עבורה המלצות למוצרים על סמך ההיסטוריה.
                    </FormHelperText>
                </FormControl>
                <FormControl display='flex' justifyContent='center' flexDirection="column" onChange={(e) => updateSettings('assignItems', e.target.checked)}>
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
            </VStack>}

            <VStack p={4} flex="1" width="100%">
                <Heading size="md" mb={4}>היסטוריית פעולות</Heading>
                <HistoryLog listId={listId} />
            </VStack>
        </VStack>
    );
};
