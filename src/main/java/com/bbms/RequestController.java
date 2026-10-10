package com.bbms;
import jakarta.validation.Valid; import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/requests") public class RequestController {
 private final BloodRequestRepository repo; public RequestController(BloodRequestRepository r){repo=r;}
 @GetMapping public List<BloodRequest> all(){return repo.findAll();}
 @PostMapping public BloodRequest create(@Valid @RequestBody RequestInput r){return repo.save(new BloodRequest(r.patientName(),r.bloodGroup(),r.hospital(),r.units()));}
 @PatchMapping("/{id}/status") public BloodRequest status(@PathVariable Long id,@RequestParam String value){BloodRequest x=repo.findById(id).orElseThrow(()->new NotFoundException("Request not found"));x.setStatus(value.toUpperCase());return repo.save(x);}
 public record RequestInput(@NotBlank String patientName,@NotBlank String bloodGroup,@NotBlank String hospital,@Min(1) int units){}
}
