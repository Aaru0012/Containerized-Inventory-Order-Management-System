from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models, schemas

# --- Product CRUD ---
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Product with SKU '{product.sku}' already exists.")

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Product with SKU '{product_update.sku}' already exists.")

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    try:
        db.delete(db_product)
        db.commit()
        return db_product
    except Exception:
        db.rollback()
        raise ValueError("Cannot delete product as it is referenced by existing orders.")

# --- Customer CRUD ---
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone
    )
    db.add(db_customer)
    try:
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Customer with email '{customer.email}' already exists.")

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer

# --- Order CRUD ---
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate):
    # 1. Check if customer exists
    db_customer = get_customer(db, order.customer_id)
    if not db_customer:
        raise ValueError(f"Customer with ID {order.customer_id} not found.")
    
    # 2. Process order items and adjust stock
    total_amount = 0.0
    db_order_items = []
    
    for item in order.items:
        db_product = db.query(models.Product).filter(models.Product.id == item.product_id).with_for_update().first()
        if not db_product:
            raise ValueError(f"Product with ID {item.product_id} not found.")
        
        if db_product.quantity < item.quantity:
            raise ValueError(
                f"Insufficient stock for product '{db_product.name}'. "
                f"Requested: {item.quantity}, Available: {db_product.quantity}."
            )
        
        # Deduct stock
        db_product.quantity -= item.quantity
        
        # Calculate pricing
        item_total = db_product.price * item.quantity
        total_amount += item_total
        
        # Create OrderItem DB record
        db_item = models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_order=db_product.price
        )
        db_order_items.append(db_item)
    
    # 3. Create Order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        items=db_order_items
    )
    
    db.add(db_order)
    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise ValueError(f"Order creation failed: {str(e)}")

def delete_order(db: Session, order_id: int):
    # Eagerly load the order details
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        return None
    
    # Eagerly serialize relations to Pydantic before deleting and committing
    customer_data = schemas.CustomerResponse.model_validate(db_order.customer)
    items_data = [
        schemas.OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_order=item.price_at_order,
            product=schemas.OrderItemProductInfo.model_validate(item.product) if item.product else None
        ) for item in db_order.items
    ]
    
    id_val = db_order.id
    customer_id = db_order.customer_id
    total_amount = db_order.total_amount
    created_at = db_order.created_at

    # Restore stock for each item in the order
    for item in db_order.items:
        db_product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if db_product:
            db_product.quantity += item.quantity
            
    db.delete(db_order)
    db.commit()
    
    # Return a fully-constructed OrderResponse Pydantic model
    return schemas.OrderResponse(
        id=id_val,
        customer_id=customer_id,
        total_amount=total_amount,
        created_at=created_at,
        customer=customer_data,
        items=items_data
    )
