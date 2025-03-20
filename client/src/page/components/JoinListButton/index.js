
import { Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, PinInput, PinInputField, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { axiosInstance } from '../../../api/axios'

export const JoinListButton = (props) => {
    const [loading, setLoading] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure()
    const pincodeRef = useRef(null)
    const toast = useToast()


    const onCompleteCode = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.post('/family/join', { joinCode })
            console.log("result", data)
            toast({
                title: data.message,
                status: 'success',
                position: 'top'
            })
            onClose();
        } catch (error) {
            console.log("errror", error)
            toast({
                title: error.response?.data?.message || 'ארעה שגיאה בעת הצטרפות לקבוצה. אנא נסה שנית',
                status: 'error',
                position: 'top'
            })

        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button onClick={onOpen} {...props} >
                הצטרף לרשימה
            </Button>
            <Modal
                isCentered
                initialFocusRef={pincodeRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent dir="rtl">
                    <ModalHeader>הקלד קוד הצטרפות לרשימה קיימת</ModalHeader>
                    <ModalBody pb={6}>
                        <HStack justifyContent="center" dir="ltr">
                            <PinInput value={joinCode} onChange={(value)=> setJoinCode(value.toUpperCase())} ref={pincodeRef} otp type="alphanumeric">
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                            </PinInput>
                        </HStack>

                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={onClose} variant={"ghost"}>ביטול</Button>
                        <Button mr={3} isLoading={loading} onClick={() => onCompleteCode(pincodeRef.current.value)} >
                            הצטרף
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
