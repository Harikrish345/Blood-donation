package com.bbms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDate;

@SpringBootApplication
public class BloodlinkApplication {
  public static void main(String[] args) { SpringApplication.run(BloodlinkApplication.class, args); }
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
  @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
    return http.csrf(csrf -> csrf.disable()).cors(cors -> {}).authorizeHttpRequests(auth -> auth.anyRequest().permitAll()).build();
  }
  @Bean CommandLineRunner migrateSchema(JdbcTemplate jdbc) {
    return args -> {
      jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group varchar(255)");
      jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar(255)");
      jdbc.execute("UPDATE users SET blood_group = 'UNKNOWN' WHERE blood_group IS NULL");
      jdbc.execute("UPDATE users SET password_hash = '' WHERE password_hash IS NULL");
      jdbc.execute("ALTER TABLE users ALTER COLUMN blood_group SET NOT NULL");
      jdbc.execute("ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL");
      jdbc.execute("UPDATE users SET enabled = true WHERE enabled IS NULL");
      jdbc.execute("ALTER TABLE users ALTER COLUMN enabled SET DEFAULT true");
      jdbc.execute("UPDATE users SET password = '' WHERE password IS NULL");
      jdbc.execute("ALTER TABLE users ALTER COLUMN password SET DEFAULT ''");
      jdbc.execute("UPDATE users SET username = email WHERE username IS NULL");
      jdbc.execute("ALTER TABLE users ALTER COLUMN username DROP DEFAULT");
      jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(255) DEFAULT 'DONOR'");
      jdbc.execute("UPDATE users SET role = 'DONOR' WHERE role IS NULL");
      jdbc.execute("ALTER TABLE blood_inventory ADD COLUMN IF NOT EXISTS quantity integer");
      jdbc.execute("UPDATE blood_inventory SET quantity = 0 WHERE quantity IS NULL");
      jdbc.execute("ALTER TABLE blood_inventory ALTER COLUMN quantity SET NOT NULL");
      try { jdbc.execute("ALTER TABLE blood_requests DROP COLUMN IF EXISTS hospital_id CASCADE"); } catch (Exception e) {}
      try { jdbc.execute("ALTER TABLE blood_requests DROP COLUMN IF EXISTS units_required CASCADE"); } catch (Exception e) {}
      try { jdbc.execute("ALTER TABLE blood_requests DROP COLUMN IF EXISTS urgency_level CASCADE"); } catch (Exception e) {}
      try { jdbc.execute("ALTER TABLE blood_requests DROP COLUMN IF EXISTS patient_id CASCADE"); } catch (Exception e) {}
    };
  }
  @Bean CommandLineRunner seed(InventoryRepository inventory, CampRepository camps, UserRepository users, PasswordEncoder encoder, BloodRequestRepository requests) {
    return args -> {
      if (inventory.count() == 0) for (String[] x : new String[][]{{"A+", "128"},{"A-","42"},{"B+","96"},{"B-","18"},{"AB+","64"},{"AB-","27"},{"O+","183"},{"O-","8"}}) inventory.save(new BloodInventory(x[0], Integer.parseInt(x[1])));
      if (camps.count() == 0) {
        camps.save(new Camp("Community Care Blood Drive", "Central City Hospital", LocalDate.now().plusDays(5), "BloodLink"));
        camps.save(new Camp("Northside Medical Donation Drive", "Northside Medical Center", LocalDate.now().plusDays(12), "Red Cross"));
        camps.save(new Camp("University Youth Health Drive", "Central Campus Quad", LocalDate.now().plusDays(20), "BloodLink Youth"));
      }
      if (!users.existsByEmailIgnoreCase("admin@bloodlink.org")) {
        users.save(new User("System Administrator", "admin@bloodlink.org", encoder.encode("admin123"), "O+", "ADMIN"));
      }
      if (!users.existsByEmailIgnoreCase("hospital@citymed.org")) {
        users.save(new User("City Medicare Hospital", "hospital@citymed.org", encoder.encode("hospital123"), "AB+", "HOSPITAL"));
      }
      if (!users.existsByEmailIgnoreCase("donor@gmail.com")) {
        users.save(new User("Sarah Jenkins", "donor@gmail.com", encoder.encode("donor123"), "O-", "DONOR"));
      }
      if (!users.existsByEmailIgnoreCase("alex.morgan@gmail.com")) {
        users.save(new User("Alex Morgan", "alex.morgan@gmail.com", encoder.encode("donor123"), "A+", "DONOR"));
      }
      if (!users.existsByEmailIgnoreCase("priya.sharma@yahoo.com")) {
        users.save(new User("Priya Sharma", "priya.sharma@yahoo.com", encoder.encode("donor123"), "B+", "DONOR"));
      }
      if (requests.count() == 0) {
        requests.save(new BloodRequest("Robert Chen", "O-", "City Medicare Hospital", 3));
        requests.save(new BloodRequest("Elena Rostova", "B+", "St. Jude Memorial", 2));
        requests.save(new BloodRequest("Marcus Vance", "A-", "Metro General", 1));
      }
    };
  }
  @Bean WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() { public void addCorsMappings(CorsRegistry registry) { registry.addMapping("/api/**").allowedOriginPatterns("*").allowedMethods("*"); } };
  }
}
