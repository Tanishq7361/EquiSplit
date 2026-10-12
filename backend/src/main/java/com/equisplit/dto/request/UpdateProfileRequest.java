package com.equisplit.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    private String name;

    private String profileImageUrl;

    public void setName(String name) {
        this.name = name != null ? name.trim() : null;
    }
}
