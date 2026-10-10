package com.bbms;
import jakarta.validation.Valid; import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime; import java.util.List;
@RestController @RequestMapping("/api/appointments") public class AppointmentController {
 private final AppointmentRepository repo; public AppointmentController(AppointmentRepository r){repo=r;}
 @GetMapping public List<Appointment> all(@RequestParam(required = false) String email){
   if (email != null && !email.isBlank()) return repo.findByEmailIgnoreCase(email);
   return repo.findAll();
 }
 @PostMapping public Appointment create(@Valid @RequestBody AppointmentInput r){
   LocalDateTime time = r.appointmentTime() != null ? r.appointmentTime() : LocalDateTime.now().plusDays(3);
   return repo.save(new Appointment(r.donorName(),r.email(),time,r.location()));
 }
 public record AppointmentInput(@NotBlank String donorName,@Email @NotBlank String email, LocalDateTime appointmentTime,@NotBlank String location){}
}
