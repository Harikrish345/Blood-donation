package com.bbms;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/blood-inventory")
public class InventoryController {
  private final InventoryRepository repository;
  public InventoryController(InventoryRepository repository) { this.repository = repository; }
  @GetMapping public List<BloodInventory> all() { return repository.findAll(); }
  @GetMapping("/{bloodGroup}") public BloodInventory one(@PathVariable String bloodGroup) {
    return repository.findByBloodGroupIgnoreCase(bloodGroup).orElseThrow(() -> new NotFoundException("Blood group not found"));
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public BloodInventory create(@Valid @RequestBody InventoryRequest r) {
    return repository.save(new BloodInventory(r.bloodGroup(), r.quantity()));
  }
  @PutMapping("/{bloodGroup}") public BloodInventory update(@PathVariable String bloodGroup, @Valid @RequestBody InventoryRequest r) {
    BloodInventory item = one(bloodGroup); item.setQuantity(r.quantity()); return repository.save(item);
  }
  public record InventoryRequest(@NotBlank String bloodGroup, @Min(0) int quantity) {}
}
