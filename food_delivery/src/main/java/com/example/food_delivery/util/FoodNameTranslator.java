package com.example.food_delivery.util;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Utility class để việt hóa tên món ăn
 * Ví dụ: "Rice 1" -> "Cơm 1", "Pasta 27" -> "Mì Ý 27"
 */
public class FoodNameTranslator {
    
    private static final Map<String, String> TRANSLATION_MAP = new HashMap<>();
    
    static {
        // Mapping các từ tiếng Anh sang tiếng Việt
        TRANSLATION_MAP.put("rice", "Cơm");
        TRANSLATION_MAP.put("pasta", "Mì Ý");
        TRANSLATION_MAP.put("butter chicken", "Gà Bơ");
        TRANSLATION_MAP.put("dosa", "Bánh Dosa");
        TRANSLATION_MAP.put("idly", "Bánh Idly");
        TRANSLATION_MAP.put("samosa", "Bánh Samosa");
        TRANSLATION_MAP.put("pizza", "Pizza");
        TRANSLATION_MAP.put("burger", "Burger");
        TRANSLATION_MAP.put("dessert", "Tráng miệng");
        TRANSLATION_MAP.put("chicken", "Gà");
        TRANSLATION_MAP.put("duck", "Vịt");
    }
    
    /**
     * Việt hóa tên món ăn
     * Ví dụ: "Rice 1" -> "Cơm 1", "Pasta 27" -> "Mì Ý 27"
     * 
     * @param englishName Tên món ăn bằng tiếng Anh
     * @return Tên món ăn đã được việt hóa
     */
    public static String translate(String englishName) {
        if (englishName == null || englishName.trim().isEmpty()) {
            return englishName;
        }
        
        String name = englishName.trim();
        String lowerName = name.toLowerCase();
        
        // Tìm từ khóa trong tên món ăn
        for (Map.Entry<String, String> entry : TRANSLATION_MAP.entrySet()) {
            String englishKey = entry.getKey().toLowerCase();
            String vietnameseValue = entry.getValue();
            
            // Kiểm tra nếu tên món ăn bắt đầu bằng từ khóa (có thể có số sau đó)
            // Ví dụ: "Rice 1", "rice1", "Rice1"
            Pattern pattern = Pattern.compile("^" + Pattern.quote(englishKey) + "\\s*(\\d+)?$", Pattern.CASE_INSENSITIVE);
            java.util.regex.Matcher matcher = pattern.matcher(lowerName);
            
            if (matcher.find()) {
                String number = matcher.group(1);
                if (number != null && !number.isEmpty()) {
                    return vietnameseValue + " " + number;
                } else {
                    return vietnameseValue;
                }
            }
            
            // Kiểm tra nếu tên món ăn chứa từ khóa (ví dụ: "Butter Chicken 1")
            if (lowerName.contains(englishKey)) {
                // Thay thế từ khóa bằng tiếng Việt
                String result = name;
                // Tìm và thay thế từ khóa (case insensitive)
                Pattern replacePattern = Pattern.compile("(?i)" + Pattern.quote(englishKey));
                result = replacePattern.matcher(result).replaceAll(vietnameseValue);
                return result;
            }
        }
        
        // Nếu không tìm thấy translation, trả về tên gốc
        return name;
    }
    
    /**
     * Việt hóa tên món ăn với pattern phức tạp hơn
     * Ví dụ: "Pasta 27" -> "Mì Ý 27", "Butter Chicken 15" -> "Gà Bơ 15"
     */
    public static String translateAdvanced(String englishName) {
        if (englishName == null || englishName.trim().isEmpty()) {
            return englishName;
        }
        
        String name = englishName.trim();
        String result = name;
        
        // Xử lý các pattern phức tạp
        // "Butter Chicken 1" -> "Gà Bơ 1"
        result = result.replaceAll("(?i)Butter\\s+Chicken", "Gà Bơ");
        result = result.replaceAll("(?i)Butter\\s+chicken", "Gà Bơ");
        result = result.replaceAll("(?i)butter\\s+chicken", "Gà Bơ");
        
        // "Pasta 27" -> "Mì Ý 27"
        result = result.replaceAll("(?i)^Pasta\\s*(\\d+)?$", "Mì Ý $1");
        
        // "Rice 16" -> "Cơm 16"
        result = result.replaceAll("(?i)^Rice\\s*(\\d+)?$", "Cơm $1");
        
        // "Dosa 67" -> "Bánh Dosa 67"
        result = result.replaceAll("(?i)^Dosa\\s*(\\d+)?$", "Bánh Dosa $1");
        
        // "Idly 1" -> "Bánh Idly 1"
        result = result.replaceAll("(?i)^Idly\\s*(\\d+)?$", "Bánh Idly $1");
        
        // "Samosa 1" -> "Bánh Samosa 1"
        result = result.replaceAll("(?i)^Samosa\\s*(\\d+)?$", "Bánh Samosa $1");
        
        // "Pizza 1" -> "Pizza 1" (giữ nguyên)
        // "Burger 1" -> "Burger 1" (giữ nguyên)
        
        // "Dessert 1" -> "Tráng miệng 1"
        result = result.replaceAll("(?i)^Dessert\\s*(\\d+)?$", "Tráng miệng $1");
        
        // Loại bỏ khoảng trắng thừa
        result = result.replaceAll("\\s+", " ").trim();
        
        return result;
    }
    
    /**
     * Reverse translation: Chuyển từ khóa tiếng Việt sang tiếng Anh để tìm kiếm trong database
     * Ví dụ: "gà" -> "chicken", "cơm" -> "rice", "gà bơ" -> "butter chicken"
     * 
     * @param vietnameseKeyword Từ khóa tiếng Việt
     * @return Danh sách các từ khóa tiếng Anh tương ứng (có thể nhiều từ)
     */
    public static java.util.List<String> reverseTranslate(String vietnameseKeyword) {
        java.util.List<String> englishKeywords = new java.util.ArrayList<>();
        
        if (vietnameseKeyword == null || vietnameseKeyword.trim().isEmpty()) {
            return englishKeywords;
        }
        
        String keyword = vietnameseKeyword.trim().toLowerCase();
        
        // Reverse mapping: từ tiếng Việt sang tiếng Anh
        // Tạo reverse map từ TRANSLATION_MAP
        Map<String, String> reverseMap = new HashMap<>();
        for (Map.Entry<String, String> entry : TRANSLATION_MAP.entrySet()) {
            reverseMap.put(entry.getValue().toLowerCase(), entry.getKey());
        }
        
        // Thêm các mapping đặc biệt
        reverseMap.put("gà bơ", "butter chicken");
        reverseMap.put("gà", "chicken");
        reverseMap.put("cơm", "rice");
        reverseMap.put("mì ý", "pasta");
        reverseMap.put("mì", "pasta");
        reverseMap.put("bánh dosa", "dosa");
        reverseMap.put("dosa", "dosa");
        reverseMap.put("bánh idly", "idly");
        reverseMap.put("idly", "idly");
        reverseMap.put("bánh samosa", "samosa");
        reverseMap.put("samosa", "samosa");
        reverseMap.put("tráng miệng", "dessert");
        
        // Tìm kiếm exact match trước
        if (reverseMap.containsKey(keyword)) {
            englishKeywords.add(reverseMap.get(keyword));
        }
        
        // Tìm kiếm partial match (keyword chứa trong value)
        for (Map.Entry<String, String> entry : reverseMap.entrySet()) {
            String vietnameseValue = entry.getKey();
            String englishKey = entry.getValue();
            
            // Nếu keyword chứa từ tiếng Việt hoặc ngược lại
            if (keyword.contains(vietnameseValue) || vietnameseValue.contains(keyword)) {
                if (!englishKeywords.contains(englishKey)) {
                    englishKeywords.add(englishKey);
                }
            }
        }
        
        // Nếu không tìm thấy, trả về keyword gốc (có thể là tiếng Anh hoặc không có trong map)
        if (englishKeywords.isEmpty()) {
            englishKeywords.add(keyword);
        }
        
        return englishKeywords;
    }
}

