package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Message;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.MessageRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.service.imp.MessageServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService implements MessageServiceImp {

    @Autowired
    MessageRepository messageRepository;

    @Autowired
    UserReponsitory userRepository;

    @Override
    public Message sendMessage(int senderId, int receiverId, String content) {
        try {
            Optional<Users> senderOptional = userRepository.findById(senderId);
            Optional<Users> receiverOptional = userRepository.findById(receiverId);
            
            if (!senderOptional.isPresent() || !receiverOptional.isPresent()) {
                System.err.println("Sender or receiver not found");
                return null;
            }
            
            Users sender = senderOptional.get();
            Users receiver = receiverOptional.get();
            
            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .content(content)
                    .isRead(false)
                    .createDate(new Date())
                    .build();
            
            return messageRepository.save(message);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Users> getConversations(int userId) {
        try {
            // Lấy danh sách users đã chat với admin (nếu userId là admin)
            // Hoặc lấy admin (nếu userId là user)
            // Lấy cả sender và receiver, sau đó merge và loại bỏ duplicate
            List<Users> receivers = messageRepository.findReceiversBySender(userId);
            List<Users> senders = messageRepository.findSendersByReceiver(userId);
            
            // Merge và loại bỏ duplicate dựa trên ID
            Map<Integer, Users> uniqueUsersMap = new HashMap<>();
            receivers.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            senders.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            
            return new ArrayList<>(uniqueUsersMap.values());
        } catch (Exception e) {
            System.err.println("Error getting conversations: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    /**
     * Lấy admin user (người quản lý chat)
     */
    public Users getAdminUser() {
        try {
            // Tìm user có role ADMIN
            // Giả sử có một admin user mặc định
            // Có thể lấy từ RoleRepository hoặc tìm user có role ADMIN
            return userRepository.findAll().stream()
                    .filter(user -> user.getRoles() != null && "ADMIN".equalsIgnoreCase(user.getRoles().getRoleName()))
                    .findFirst()
                    .orElse(null);
        } catch (Exception e) {
            System.err.println("Error getting admin user: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Lấy danh sách users đã chat với admin (dành cho admin)
     * Chỉ lấy users (không lấy admin khác)
     */
    public List<Users> getUsersForAdmin(int adminId) {
        try {
            System.out.println("Getting users for admin ID: " + adminId);
            // Lấy tất cả conversation partners bằng cách lấy cả sender và receiver
            List<Users> receivers = messageRepository.findReceiversBySender(adminId);
            List<Users> senders = messageRepository.findSendersByReceiver(adminId);
            
            System.out.println("Found " + receivers.size() + " receivers and " + senders.size() + " senders");
            
            // Merge và loại bỏ duplicate dựa trên ID
            Map<Integer, Users> uniqueUsersMap = new HashMap<>();
            receivers.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            senders.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            
            System.out.println("Total unique users: " + uniqueUsersMap.size());
            
            // Lọc chỉ lấy users (không phải admin)
            // Nếu user.getRoles() là null, coi như là USER (không phải admin)
            List<Users> filteredUsers = uniqueUsersMap.values().stream()
                    .filter(user -> {
                        if (user.getRoles() == null) {
                            // Nếu không có role, coi như là USER
                            System.out.println("User " + user.getId() + " has no role, treating as USER");
                            return true;
                        }
                        String roleName = user.getRoles().getRoleName();
                        boolean isNotAdmin = !"ADMIN".equalsIgnoreCase(roleName);
                        System.out.println("User " + user.getId() + " has role: " + roleName + ", isNotAdmin: " + isNotAdmin);
                        return isNotAdmin;
                    })
                    .collect(Collectors.toList());
            
            System.out.println("Filtered users (non-admin): " + filteredUsers.size());
            return filteredUsers;
        } catch (Exception e) {
            System.err.println("Error getting users for admin: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public List<Message> getConversation(int userId, int otherUserId) {
        try {
            return messageRepository.findConversation(userId, otherUserId);
        } catch (Exception e) {
            System.err.println("Error getting conversation: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public List<Message> getLastMessages(int userId) {
        try {
            System.out.println("Getting last messages for user ID: " + userId);
            // Lấy tất cả messages của user, sau đó group theo conversation và lấy message cuối cùng
            List<Message> allMessages = messageRepository.findAllMessagesByUser(userId);
            System.out.println("Found " + allMessages.size() + " total messages");
            
            // Group messages theo conversation partner và lấy message cuối cùng của mỗi conversation
            Map<Integer, Message> lastMessageMap = new HashMap<>();
            
            for (Message msg : allMessages) {
                // Xác định conversation partner (người khác trong conversation)
                int otherUserId = msg.getSender().getId() == userId ? msg.getReceiver().getId() : msg.getSender().getId();
                
                // Lấy message cuối cùng cho mỗi conversation (message đầu tiên vì đã sort DESC)
                if (!lastMessageMap.containsKey(otherUserId)) {
                    lastMessageMap.put(otherUserId, msg);
                }
            }
            
            System.out.println("Returning " + lastMessageMap.size() + " last messages");
            return new ArrayList<>(lastMessageMap.values());
        } catch (Exception e) {
            System.err.println("Error getting last messages: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public long getUnreadCount(int userId) {
        try {
            return messageRepository.countByReceiverIdAndIsReadFalse(userId);
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public boolean markConversationAsRead(int userId, int otherUserId) {
        try {
            messageRepository.markConversationAsRead(userId, otherUserId);
            return true;
        } catch (Exception e) {
            System.err.println("Error marking conversation as read: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Lấy danh sách staff users đã chat với user (dành cho user)
     * User có thể nhắn với staff
     */
    public List<Users> getStaffUsers(int userId) {
        try {
            // Lấy tất cả conversation partners
            List<Users> receivers = messageRepository.findReceiversBySender(userId);
            List<Users> senders = messageRepository.findSendersByReceiver(userId);
            
            // Merge và loại bỏ duplicate
            Map<Integer, Users> uniqueUsersMap = new HashMap<>();
            receivers.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            senders.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            
            // Lọc chỉ lấy staff (không lấy user khác hoặc admin)
            return uniqueUsersMap.values().stream()
                    .filter(user -> {
                        if (user.getRoles() == null) {
                            return false;
                        }
                        String roleName = user.getRoles().getRoleName();
                        return "RESTAURANT_STAFF".equalsIgnoreCase(roleName);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting staff users: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    /**
     * Lấy danh sách users và drivers đã chat với staff (dành cho staff)
     * Staff có thể nhắn với user và driver
     */
    public List<Users> getUsersAndDriversForStaff(int staffId) {
        try {
            // Lấy tất cả conversation partners
            List<Users> receivers = messageRepository.findReceiversBySender(staffId);
            List<Users> senders = messageRepository.findSendersByReceiver(staffId);
            
            // Merge và loại bỏ duplicate
            Map<Integer, Users> uniqueUsersMap = new HashMap<>();
            receivers.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            senders.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            
            // Lọc chỉ lấy user và driver (không lấy staff khác hoặc admin)
            return uniqueUsersMap.values().stream()
                    .filter(user -> {
                        if (user.getRoles() == null) {
                            return true; // Coi như là USER
                        }
                        String roleName = user.getRoles().getRoleName();
                        return "USER".equalsIgnoreCase(roleName) || "DRIVER".equalsIgnoreCase(roleName);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting users and drivers for staff: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    /**
     * Lấy danh sách users và staff đã chat với driver (dành cho driver)
     * Driver có thể nhắn với user và staff
     */
    public List<Users> getUsersAndStaffForDriver(int driverId) {
        try {
            // Lấy tất cả conversation partners
            List<Users> receivers = messageRepository.findReceiversBySender(driverId);
            List<Users> senders = messageRepository.findSendersByReceiver(driverId);
            
            // Merge và loại bỏ duplicate
            Map<Integer, Users> uniqueUsersMap = new HashMap<>();
            receivers.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            senders.forEach(user -> uniqueUsersMap.put(user.getId(), user));
            
            // Lọc chỉ lấy user và staff (không lấy driver khác hoặc admin)
            return uniqueUsersMap.values().stream()
                    .filter(user -> {
                        if (user.getRoles() == null) {
                            return true; // Coi như là USER
                        }
                        String roleName = user.getRoles().getRoleName();
                        return "USER".equalsIgnoreCase(roleName) || "RESTAURANT_STAFF".equalsIgnoreCase(roleName);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting users and staff for driver: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    /**
     * Lấy danh sách tất cả staff users available (không cần đã chat trước)
     * Dành cho user để tìm staff hỗ trợ
     */
    public List<Users> getAllAvailableStaffUsers() {
        try {
            System.out.println("=== getAllAvailableStaffUsers() called ===");
            // Lấy tất cả users có role RESTAURANT_STAFF
            List<Users> allStaff = userRepository.findByRoleName("RESTAURANT_STAFF");
            System.out.println("Found " + allStaff.size() + " staff users");
            
            // Filter only active staff (if there's an active field)
            // For now, return all staff
            return allStaff;
        } catch (Exception e) {
            System.err.println("Error getting all available staff users: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
}

