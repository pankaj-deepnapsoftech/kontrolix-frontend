// @ts-nocheck

import { Button, Select, Spinner, Badge, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { io } from "socket.io-client";
import { requestApi } from "../redux/api/api";
import { colors } from "../theme/colors";
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  useFetchRequestsQuery,
  useCreateRequestMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
} from "../redux/api/api";

const Requests: React.FC = () => {
  const dispatch = useDispatch();
  const { isSuper, isSupervisor, id: userId } = useSelector((state: any) => state.auth);
  const { data, isLoading, refetch } = useFetchRequestsQuery();
  const [createRequest] = useCreateRequestMutation();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [cookies] = useCookies();
  const socketRef = useRef<any>(null);

  const [searchKey, setSearchKey] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comment, setComment] = useState<string>("");
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  const [formData, setFormData] = useState({
    reason: "",
    type: "breakfast",
  });

  const requests = data?.requests || [];

  // Socket setup for real-time updates
  useEffect(() => {
    if (!cookies?.access_token) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 
      (process.env.REACT_APP_BACKEND_URL || '').replace(/\/api\/?$/, '') || 
      'http://localhost:9023';
    
    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      extraHeaders: {
        Authorization: `Bearer ${cookies?.access_token || ''}`,
      },
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected for requests');
      // Send user data when subscribing
      socketRef.current.emit('subscribeRequests', {
        userId: userId,
        isSupervisor: isSupervisor,
        isSuper: isSuper
      });
    });

    socketRef.current.on('requestCreated', (newRequest: any) => {
      console.log('New request created via socket:', newRequest);
      // Invalidate RTK Query cache to trigger refetch
      dispatch(requestApi.util.invalidateTags(['Request']));
      if (isSuper || isSupervisor) {
        toast.info('New request created');
      }
    });

    socketRef.current.on('requestUpdated', (updatedRequest: any) => {
      console.log('Request updated via socket:', updatedRequest);
      // Invalidate RTK Query cache to trigger refetch
      dispatch(requestApi.util.invalidateTags(['Request']));
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected for requests');
    });

    socketRef.current.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('requestCreated');
        socketRef.current.off('requestUpdated');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [cookies?.access_token, dispatch, isSuper, isSupervisor]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((req: any) => {
        if (filterStatus === "pending") {
          return req.status === "pending";
        } else if (filterStatus === "supervisor_approved") {
          return req.status === "supervisor_approved";
        } else if (filterStatus === "admin_approved") {
          return req.status === "admin_approved";
        } else if (filterStatus === "rejected") {
          return req.status === "rejected";
        }
        return true;
      });
    }

    // Filter by search
    if (searchKey) {
      const searchLower = searchKey.toLowerCase();
      filtered = filtered.filter((req: any) => {
        return (
          req.employee?.first_name?.toLowerCase().includes(searchLower) ||
          req.employee?.last_name?.toLowerCase().includes(searchLower) ||
          req.employee?.email?.toLowerCase().includes(searchLower) ||
          req.reason?.toLowerCase().includes(searchLower) ||
          req.type?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [requests, filterStatus, searchKey]);

  const handleCreateRequest = async () => {
    try {
      if (!formData.reason.trim()) {
        toast.error("Please provide a reason");
        return;
      }
      await createRequest(formData).unwrap();
      toast.success("Request created successfully");
      onCreateClose();
      setFormData({ reason: "", type: "breakfast" });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create request");
    }
  };

  const handleApprove = async () => {
    try {
      await approveRequest({ _id: selectedRequest._id, comment }).unwrap();
      toast.success("Request approved successfully");
      onApproveClose();
      setComment("");
      setSelectedRequest(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest({ _id: selectedRequest._id, comment }).unwrap();
      toast.success("Request rejected successfully");
      onRejectClose();
      setComment("");
      setSelectedRequest(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject request");
    }
  };

  const getStatusBadge = (request: any) => {
    if (request.status === "admin_approved") {
      return (
        <Badge colorScheme="green" px={2} py={1} borderRadius="md">
          <div className="flex items-center gap-1">
            <CheckCircle size={14} />
            Approved
          </div>
        </Badge>
      );
    } else if (request.status === "supervisor_approved") {
      return (
        <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            Supervisor Approved
          </div>
        </Badge>
      );
    } else if (request.status === "rejected") {
      return (
        <Badge colorScheme="red" px={2} py={1} borderRadius="md">
          <div className="flex items-center gap-1">
            <XCircle size={14} />
            Rejected
          </div>
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme="yellow" px={2} py={1} borderRadius="md">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            Pending
          </div>
        </Badge>
      );
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      tea: "Tea",
      personal: "Personal",
      other: "Other",
    };
    return labels[type] || type;
  };

  const canApprove = useCallback((request: any) => {
    if (isSuper) {
      // Admin can approve if:
      // 1. Status is pending (admin can approve directly)
      // 2. Status is supervisor_approved (supervisor has approved, waiting for admin)
      // 3. Not already approved or rejected by admin
      const isPending = request.status === "pending";
      const isSupervisorApproved = request.status === "supervisor_approved" || 
                                   request.supervisorApproval?.status === "approved";
      const isAdminPending = request.adminApproval?.status === "pending" || 
                            !request.adminApproval?.status ||
                            request.status !== "admin_approved";
      const notRejected = request.status !== "rejected" && request.adminApproval?.status !== "rejected";
      
      const result = (isPending || isSupervisorApproved) && isAdminPending && notRejected;
      return result;
    } else if (isSupervisor) {
      // Supervisor can approve if status is pending
      return request.status === "pending" || 
             (request.supervisorApproval?.status === "pending" && request.status !== "rejected");
    }
    return false;
  }, [isSuper, isSupervisor]);

  const canReject = useCallback((request: any) => {
    if (isSuper) {
      // Admin can reject if status is pending or supervisor_approved (not yet admin approved/rejected)
      const notFinalized = request.status !== "admin_approved" && request.status !== "rejected";
      const adminNotDecided = request.adminApproval?.status !== "approved" && 
                              request.adminApproval?.status !== "rejected";
      return (request.status === "pending" || request.status === "supervisor_approved") && 
             notFinalized && adminNotDecided;
    } else if (isSupervisor) {
      // Supervisor can reject if status is pending
      return request.status === "pending" || 
             (request.supervisorApproval?.status === "pending" && request.status !== "rejected");
    }
    return false;
  }, [isSuper, isSupervisor]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r: any) => r.status === "pending").length;
    const supervisorApproved = requests.filter((r: any) => r.status === "supervisor_approved").length;
    const approved = requests.filter((r: any) => r.status === "admin_approved").length;
    const rejected = requests.filter((r: any) => r.status === "rejected").length;

    return { total, pending, supervisorApproved, approved, rejected };
  }, [requests]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.page }}>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.page }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
              Requests
            </h1>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Manage employee requests for breaks and other activities
            </p>
          </div>
          {!isSuper && !isSupervisor && (
            <Button
              leftIcon={<Plus size={20} />}
              onClick={onCreateOpen}
              style={{
                backgroundColor: colors.primary[500],
                color: "white",
              }}
              _hover={{ backgroundColor: colors.primary[600] }}
            >
              Create Request
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Total</div>
            <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>{stats.total}</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Pending</div>
            <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{stats.pending}</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Supervisor Approved</div>
            <div className="text-2xl font-bold" style={{ color: "#3B82F6" }}>{stats.supervisorApproved}</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Approved</div>
            <div className="text-2xl font-bold" style={{ color: "#10B981" }}>{stats.approved}</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.text.secondary }}>Rejected</div>
            <div className="text-2xl font-bold" style={{ color: "#EF4444" }}>{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.text.secondary }} />
            <input
              type="text"
              placeholder="Search by employee name, email, or reason..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
              style={{ backgroundColor: colors.background.card, borderColor: colors.border.light, color: colors.text.primary }}
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            width="200px"
            style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="supervisor_approved">Supervisor Approved</option>
            <option value="admin_approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>

        {/* Requests Table */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}>
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto mb-4" style={{ color: colors.text.secondary }} />
              <p style={{ color: colors.text.secondary }}>No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: colors.background.page, borderBottom: `1px solid ${colors.border.light}` }}>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Supervisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Date</th>
                    {(isSuper || isSupervisor) && (
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.text.secondary }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: colors.border.light }}>
                  {filteredRequests.map((request: any) => (
                    <tr key={request._id} className="hover:bg-opacity-50" style={{ backgroundColor: colors.background.card }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium" style={{ color: colors.text.primary }}>
                            {request.employee?.first_name} {request.employee?.last_name}
                          </div>
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            {request.employee?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge colorScheme="purple">{getTypeLabel(request.type)}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate" style={{ color: colors.text.primary }} title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: colors.text.primary }}>
                          {request.supervisor?.first_name} {request.supervisor?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.text.secondary }}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      {(isSuper || isSupervisor) && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canApprove(request) ? (
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  onApproveOpen();
                                }}
                              >
                                Approve
                              </Button>
                            ) : null}
                            {canReject(request) ? (
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  onRejectOpen();
                                }}
                              >
                                Reject
                              </Button>
                            ) : null}
                            {isSuper && !canApprove(request) && !canReject(request) && (
                              <span className="text-xs text-gray-400">No action</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>Type</label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="tea">Tea</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>Reason</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for request..."
                  rows={4}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateRequest}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Approve Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Approve Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                  Employee: {selectedRequest?.employee?.first_name} {selectedRequest?.employee?.last_name}
                </p>
                <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                  Type: {getTypeLabel(selectedRequest?.type)}
                </p>
                <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                  Reason: {selectedRequest?.reason}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>Comment (Optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onApproveClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleApprove}>
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                  Employee: {selectedRequest?.employee?.first_name} {selectedRequest?.employee?.last_name}
                </p>
                <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                  Type: {getTypeLabel(selectedRequest?.type)}
                </p>
                <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
                  Reason: {selectedRequest?.reason}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>Comment (Optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRejectClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleReject}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Requests;

