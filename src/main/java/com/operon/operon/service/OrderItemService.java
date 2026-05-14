package com.operon.operon.service;

import com.operon.operon.dto.OrderItemCreateRequest;
import com.operon.operon.dto.OrderItemDTO;
import com.operon.operon.model.OrderItem;
import com.operon.operon.model.Part;
import com.operon.operon.model.ServiceType;
import com.operon.operon.model.WorkOrder;
import com.operon.operon.repository.OrderItemRepository;
import com.operon.operon.repository.PartRepository;
import com.operon.operon.repository.ServiceTypeRepository;
import com.operon.operon.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;


    public List<OrderItemDTO>  getAllOrderItems(){
        return orderItemRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderItemDTO> getByWorkOrder(Long workOrderId){
        return orderItemRepository.findByWorkOrder_Id(workOrderId).stream().map(this::toDTO).collect(Collectors.toList());
    }
    public List<OrderItemDTO> getByPart(Long partId){
        return orderItemRepository.findByPart_Id(partId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public OrderItemDTO getById(Long id) {
        return toDTO(orderItemRepository.findById(id).orElseThrow(() -> new RuntimeException("OrderItem not found with id: " + id)));
    }
    public OrderItemDTO createOrderItem(OrderItemCreateRequest request){
        boolean hasPart=request.getPartId()!=null;
        boolean hasServiceType= request.getServiceTypeId()!=null;

        if (hasPart == hasServiceType) {
            throw new IllegalArgumentException("Tačno jedan od partId ili serviceTypeId mora biti popunjen.");
        }

        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId()).orElseThrow(()-> new RuntimeException("Workorder not fount with id: "+ request.getWorkOrderId()));

        OrderItem item =new OrderItem();
        item.setWorkOrder(workOrder);
        item.setQuantity(request.getQuantity());
        item.setDiscount(request.getDiscount());

        if(hasPart){
            Part part= partRepository.findById(request.getPartId()).orElseThrow(()-> new RuntimeException("Part has not been found wiht id: "+ request.getPartId()));
            item.setPart(part);
            item.setPrice(part.getPrice());
        }else{
            ServiceType serviceType = serviceTypeRepository.findById(request.getServiceTypeId()).orElseThrow(() -> new RuntimeException("ServiceType not found with id: " + request.getServiceTypeId()));
            item.setServiceType(serviceType);
            item.setPrice(serviceType.getPrice());
        }

        return toDTO(orderItemRepository.save(item));

    }

    public void deleteOrderItem(Long id) {
        if (!orderItemRepository.existsById(id)) {
            throw new RuntimeException("OrderItem not found with id: " + id);
        }
        orderItemRepository.deleteById(id);
    }




    private OrderItemDTO toDTO(OrderItem item) {
        OrderItemDTO dto =new OrderItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setDiscount(item.getDiscount());

        dto.setWorkOrderId(item.getWorkOrder().getId());
        //provere da jedno mora biti null
        dto.setPartId(item.getPart() != null ? item.getPart().getId() : null);
        dto.setServiceTypeId(item.getServiceType() != null ? item.getServiceType().getId() : null);
        return dto;
    }

}
