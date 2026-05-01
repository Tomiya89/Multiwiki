package com.multiwiki.staff.responses;

import com.multiwiki.common.responses.ErrorResponse;
import com.multiwiki.staff.EnumStaffResponse;

public class StaffErrorResponse extends ErrorResponse<EnumStaffResponse> {
    public StaffErrorResponse(EnumStaffResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
