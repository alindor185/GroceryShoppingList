import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const UserDropdown = ({ users, onSelect, selectedUser }) => {
  return (
    <Menu portalProps={{ appendToParentPortal: false }}>
      <MenuButton
        as={Button}
        colorScheme="gray"
        rightIcon={<ChevronDownIcon color="black" />}
        width="140px"
        bg="white"
        p={2}
        border="1px solid #CBD5E0"
        _hover={{ bg: "white" }}
        _focus={{ bg: "white", boxShadow: "outline" }}
      >
        <Flex align="center">
          {selectedUser ? (
            <>
              <Avatar src={selectedUser?.image || ""} size="xs" mr={2} />
              <Text color="gray.600" fontSize="12px">
                {selectedUser.fullName || selectedUser?.email}
              </Text>
            </>
          ) : (
            <Text color="gray.500" fontSize="12px">הקצה מוצר לאדם...</Text>
          )}
        </Flex>
      </MenuButton>

      <MenuList zIndex="popover" position="absolute" isLazy>
        {users.map((user) => (
          <MenuItem
            key={user._id}
            onClick={() => onSelect(user)}
            _hover={{ bg: "gray.100" }}
          >
            <Flex align="center" width="95%">
              <Avatar src={user.image || ""} size="sm" mr={3} />
              <Text>{user.fullName || user?.email}</Text>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
