import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  useToast,
} from "@chakra-ui/react";

interface Role {
  role: string;
  description: string;
  createdOn: string;
  lastUpdated: string;
}

interface RoleModalsProps {
  isViewOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  onViewClose: () => void;
  onEditClose: () => void;
  onDeleteClose: () => void;
  selectedRole: Role | null;
  editForm: {
    role: string;
    description: string;
    createdOn: string;
    lastUpdated: string;
  };
  setEditForm: (form: any) => void;
  onSaveEdit: () => void;
  onConfirmDelete: () => void;
}

const RoleModals: React.FC<RoleModalsProps> = ({
  isViewOpen,
  isEditOpen,
  isDeleteOpen,
  onViewClose,
  onEditClose,
  onDeleteClose,
  selectedRole,
  editForm,
  setEditForm,
  onSaveEdit,
  onConfirmDelete,
}) => {
  return (
    <>
      {/* View Role Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>View Role Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRole && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontWeight="bold">Role Name</FormLabel>
                  <Text p={3} bg="gray.50" borderRadius="md">
                    {selectedRole.role}
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Description</FormLabel>
                  <Text p={3} bg="gray.50" borderRadius="md">
                    {selectedRole.description}
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Created On</FormLabel>
                  <Text p={3} bg="gray.50" borderRadius="md">
                    {selectedRole.createdOn}
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Last Updated</FormLabel>
                  <Text p={3} bg="gray.50" borderRadius="md">
                    {selectedRole.lastUpdated}
                  </Text>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Role Name</FormLabel>
                <Input
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  placeholder="Enter role name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Enter role description"
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Created On</FormLabel>
                <Input
                  value={editForm.createdOn}
                  onChange={(e) =>
                    setEditForm({ ...editForm, createdOn: e.target.value })
                  }
                  placeholder="Enter creation date"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Last Updated</FormLabel>
                <Input
                  value={editForm.lastUpdated}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastUpdated: e.target.value })
                  }
                  placeholder="Enter last update date"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={onSaveEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Role Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the role "{selectedRole?.role}"?
              This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RoleModals;
