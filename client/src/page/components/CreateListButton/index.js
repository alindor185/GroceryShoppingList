
import { Button, Divider, FormControl, FormHelperText, FormLabel, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Switch, Text, useDisclosure, useToast, VStack } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { axiosInstance } from '../../../api/axios'
import { AvatarUploader } from '../AvatarUploader';
import { generateImageUrlWithRandomBackground } from '../AvatarUploader/helper';

const default_avatar = "https://imgproxy.attic.sh/mszBBlHKyVpwOIC-gpJQc-x-VUGn-CfQOTWaw8_flWA/rs:fit:768:768:1:1/t:1:FF00FF:false:false/pngo:false:true:256/aHR0cHM6Ly9hdHRp/Yy5zaC9jYXEycTh6/cGVwNnN6cGNqaWZx/NGoyNjY0aXRm.png";

export const CreateListButton = ({ onSuccess, ...props}) => {
    const [loading, setLoading] = useState(false);
    const [listName, setListName] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [avatar, setAvatar] = useState(null)
    const [settings, setSettings] = useState({
        continious: false,
        assignItems: false
    })
    const nameInputRef = useRef(null)
    const toast = useToast()

    useEffect(()=> {
        generateImageUrlWithRandomBackground(default_avatar).then((imageUrl) => {
            setAvatar(imageUrl)
        });
    }, [isOpen])


    const onCreateList = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.post('/lists', { name: listName , settings, imageUrl: avatar})
            onSuccess(data.list)
            toast({
                title: data.message,
                status: 'success',
                position: 'top'
            })
            onClose();
        } catch (error) {
            console.log("errror", error)
            toast({
                title: error.response?.data?.message || 'ארעה שגיאה בעת יצירת רשימה. אנא נסה שנית',
                status: 'error',
                position: 'top'
            })

        } finally {
            setLoading(false);
        }
    }

    const setSettingValue = (type, value) => {
        setSettings({
            ...settings,
            [type]: value
        })
    }

    return (
        <>
            <Button onClick={onOpen} {...props} >
                יצירת רשימה
            </Button>
            <Modal
                isCentered
                initialFocusRef={nameInputRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent dir="rtl">
                    <ModalHeader>יצירת רשימה חדשה</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack gap="2">

                            <Text mb='1rem'>
                                לאחר שתיצור את הרשימה, תוכל לשתף עם אנשים את קוד ההצטרפות.
                            </Text>

                            <AvatarUploader avatar={avatar} setAvatar={setAvatar}/>
                            <FormControl isRequired onChange={(e) => setListName(e.target.value)}>
                                <FormLabel>שם הרשימה</FormLabel>
                                <Input ref={nameInputRef} placeholder='רשימת הקניות שלי...' />
                            </FormControl>

                            <Divider orientation='horizontal' />

                            <Text fontWeight="bold" mb='1rem' textAlign="right"> הגדרות הרשימה</Text>

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

                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={onClose} variant={"ghost"}>ביטול</Button>
                        <Button mr={3} isLoading={loading} onClick={onCreateList} >
                            יצירה
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
