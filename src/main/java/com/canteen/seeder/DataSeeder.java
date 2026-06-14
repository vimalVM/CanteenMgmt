package com.canteen.seeder;

import com.canteen.model.*;
import com.canteen.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCategories();
        seedMenuItems();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@canteen.com")) {
            userRepository.save(User.builder()
                    .name("Canteen Admin").email("admin@canteen.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN).phone("9999999999").isActive(true)
                    .createdAt(LocalDateTime.now()).build());
        }
        if (!userRepository.existsByEmail("student1@college.edu")) {
            userRepository.save(User.builder()
                    .name("Rahul Sharma").email("student1@college.edu")
                    .password(passwordEncoder.encode("pass123"))
                    .role(Role.STUDENT).phone("9876543210")
                    .registrationNumber("STU2024001").isActive(true)
                    .createdAt(LocalDateTime.now()).build());
        }
        if (!userRepository.existsByEmail("student2@college.edu")) {
            userRepository.save(User.builder()
                    .name("Priya Patel").email("student2@college.edu")
                    .password(passwordEncoder.encode("pass123"))
                    .role(Role.STUDENT).phone("9876543211")
                    .registrationNumber("STU2024002").isActive(true)
                    .createdAt(LocalDateTime.now()).build());
        }
        System.out.println("✅ Users seeded");
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        categoryRepository.saveAll(List.of(
            Category.builder().name("Breakfast").description("Start your day right").displayOrder(1).iconUrl("🌅").build(),
            Category.builder().name("Lunch").description("Hearty meals for midday").displayOrder(2).iconUrl("🍛").build(),
            Category.builder().name("Snacks").description("Quick bites anytime").displayOrder(3).iconUrl("🍟").build(),
            Category.builder().name("Beverages").description("Refreshing drinks").displayOrder(4).iconUrl("☕").build(),
            Category.builder().name("Desserts").description("Sweet treats").displayOrder(5).iconUrl("🍰").build()
        ));
        System.out.println("✅ Categories seeded");
    }

    private void seedMenuItems() {
        if (menuItemRepository.count() > 0) return;
        String img = "https://images.unsplash.com/photo-";
        menuItemRepository.saveAll(List.of(
            mi("Masala Dosa", "Crispy rice crepe with potato filling", 60, "Breakfast", img+"1630383249896-424e482df921?w=400", true, 15, 250),
            mi("Poha", "Flattened rice with peanuts and veggies", 40, "Breakfast", img+"1645177628172-a94c1f96e6db?w=400", true, 10, 180),
            mi("Idli Sambar", "Steamed rice cakes with lentil soup", 50, "Breakfast", img+"1589301760435-2634ec6b92a3?w=400", true, 12, 200),
            mi("Veg Thali", "Complete meal with roti, dal, sabzi, rice", 120, "Lunch", img+"1546833999-2e5b28a2d9c8?w=400", true, 20, 550),
            mi("Chicken Biryani", "Fragrant basmati rice with spiced chicken", 150, "Lunch", img+"1563379091339-03b21ab4a4f4?w=400", false, 25, 650),
            mi("Paneer Butter Masala", "Cottage cheese in rich tomato gravy", 130, "Lunch", img+"1631452180519-c014fe946bc7?w=400", true, 20, 450),
            mi("Samosa", "Crispy pastry with spiced potato filling", 20, "Snacks", img+"1601050690597-df0568f70950?w=400", true, 8, 150),
            mi("Vada Pav", "Spiced potato fritter in a bun", 30, "Snacks", img+"1606491956689-2ea866880049?w=400", true, 10, 200),
            mi("French Fries", "Crispy golden potato fries", 50, "Snacks", img+"1573080496219-bb080dd4f877?w=400", true, 12, 300),
            mi("Chicken Sandwich", "Grilled chicken with veggies in bread", 80, "Snacks", img+"1528735602780-2552fd46c7af?w=400", false, 10, 350),
            mi("Masala Chai", "Traditional Indian spiced tea", 20, "Beverages", img+"1597318181409-cf64d0b5d8a2?w=400", true, 5, 80),
            mi("Cold Coffee", "Chilled coffee with ice cream", 60, "Beverages", img+"1461023058943-07fcbe16d735?w=400", true, 8, 200),
            mi("Fresh Lime Soda", "Refreshing lime with soda water", 30, "Beverages", img+"1513558161293-7e2a3e025f28?w=400", true, 5, 50),
            mi("Gulab Jamun", "Deep-fried milk balls in sugar syrup", 40, "Desserts", img+"1666190094762-18a4d63e3cd0?w=400", true, 5, 300),
            mi("Chocolate Brownie", "Rich chocolate fudge brownie", 70, "Desserts", img+"1606313564200-e75d5e30476c?w=400", true, 5, 400)
        ));
        System.out.println("✅ Menu items seeded");
    }

    private MenuItem mi(String name, String desc, double price, String cat, String img, boolean veg, int prep, int cal) {
        return MenuItem.builder().name(name).description(desc).price(price).category(cat)
                .imageUrl(img).available(true).isVeg(veg).preparationTime(prep)
                .calories(cal).rating(0).totalOrders(0).isDailySpecial(false).ratingCount(0).build();
    }
}
