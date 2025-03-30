import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  Spinner,
  VStack,
  HStack,
  Tag,
  useColorModeValue,
  Alert,
  Avatar,

  AlertIcon,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

const actionColors = {
  add_item: 'green',
  delete_item: 'red',
  update_item: 'yellow',
  mark_purchased: 'blue',
  create: 'purple',
  update_list_settings: 'cyan',
  join_list: 'teal',
};

const ACTION_TEXT = {
  add_item: 'הוספת מוצר',
  delete_item: 'מחיקת מוצר',
  update_item: 'עדכון מוצר',
  mark_purchased: 'סימון מוצר כנרכש',
  create: 'יצירת הרשימה',
  update_list_settings: 'עדכון הגדרות הרשימה',
  join_list: 'משתמש הצטרף לרשימה'
  
}

const SHOW_ITEM = ['add_item', 'delete_item', 'update_item', 'mark_purchased'];

export const HistoryLog = () => {
  const { listId } = useParams();
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMessage('משתמש לא מחובר. יש להיכנס.');
          return;
        }

        if (!listId) {
          setErrorMessage('לא נבחרה רשימה להצגת היסטוריה.');
          return;
        }

        const { data } = await axiosInstance(`/history?listId=${listId}`);

        setHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching history:', error);
        setErrorMessage(error.message || 'אירעה שגיאה בלתי צפויה');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [listId]);

  return (
      <Box pt={0} padding={2} overflowY="auto" maxH="545px" width="100%"  
       sx={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-ms-overflow-style": "none", // Hide scrollbar in IE and Edge
        "scrollbar-width": "none", // Hide scrollbar in Firefox
      }}
    >
        {isLoading ? (
          <Spinner />
        ) : errorMessage ? (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {errorMessage}
          </Alert>
        ) : history.length > 0 ? (
          <VStack align="stretch" spacing={4} width="100%">
            {history.map((log) => (
              <Box
                key={log._id}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.300"
                transition="0.2s ease"
                _hover={{ transform: 'scale(1.01)', boxShadow: 'md' }}
              >
                <HStack justify="space-between" mb={2}>
                <HStack>
                    <Avatar size="sm" src={log.performedBy.image}  border/>
                    <Text>{log.performedBy.fullName || log.performedBy.email || 'לא ידוע'}</Text>
                </HStack>

                  {/* <Text fontWeight="bold" color="blue.600">{log.performedBy.fullName || log.performedBy?.email || 'משתמש לא ידוע'}</Text> */}
                  <Tag colorScheme={actionColors[log.action]} variant="subtle">{ACTION_TEXT[log.action]}</Tag>
                </HStack>
                {SHOW_ITEM.includes(log.action) && <Text>
                  <strong>מוצר:</strong>{' '}
                  {log.action === 'delete_item'
                    ? log.previousState?.name || 'לא ידוע'
                    : log.itemId?.name || 'לא ידוע'}
                </Text>}
                <Text><strong>רשימה:</strong> {log.list?.name || 'ברירת מחדל'}</Text>
                <Text fontSize="sm" color="gray.500">
                  {log.date ? new Date(log.date).toLocaleString({ hourCycle: 'h24'}) : 'תאריך לא ידוע'}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text p={2}>אין היסטוריה זמינה לרשימה זו.</Text>
        )}
      </Box>
  );
};

export default HistoryLog;
