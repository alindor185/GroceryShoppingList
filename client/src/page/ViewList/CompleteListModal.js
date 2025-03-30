import React, { useState } from 'react';
import { Button, Modal, useToast, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from "@chakra-ui/react"
import { useParams , useNavigate} from 'react-router-dom';
import {axiosInstance} from '../../api/axios';

export const CompleteListModal = ({ isOpen, onOpen, onClose }) => {
    const { listId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const onCompleteList = async () => {
        setLoading(true);
        try {
            // Call API to complete list
            const result = await axiosInstance.post(`/lists/${listId}/complete`, { listId: listId });
            toast({
                title: result.message,
                status: "success",
                duration: 1000,
                isClosable: true,
            });
            navigate('/');            
        } catch(error) {
            console.log(error);
            toast({
                title: error?.message || "אירעה שגיאה בעת השלמת הרשימה",
                status: "error",
                duration: 1000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }
    return (
  
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>נראה שכל המוצרים ברשימה זו נרכשו...</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              האם ברצונך להעביר רשימה זו לארכיון?
            </ModalBody>
  
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={onClose}>
                בטל
              </Button>
              <Button onClick={onCompleteList} isLoading={loading}>העבר רשימה לארכיון</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    )
  }