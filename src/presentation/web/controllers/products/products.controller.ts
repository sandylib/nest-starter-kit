import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PRODUCTS } from "../../../../shared/constants/domains/products.constants";
import { HTTP_STATUS } from "../../../../shared/constants/http.constants";
import { ApiDatabaseDocumentation } from "../../decorators/api-documentation.decorator";
import { ProductsService } from "../../../../application/use-cases/products.service";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from "../../dto/product.dto";
import {
  toProductDto,
  toProductDtos,
} from "../../../../infrastructure/mappers/products.mapper";

@ApiTags(PRODUCTS.ROUTES.TAG)
@ApiBearerAuth()
@Controller(PRODUCTS.ROUTES.BASE)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: PRODUCTS.DOCS.LIST.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: PRODUCTS.DOCS.LIST.RESPONSE,
    type: [ProductResponseDto],
  })
  @ApiDatabaseDocumentation()
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll();
    return toProductDtos(products);
  }

  @Get(PRODUCTS.ROUTES.PARAMS.ID)
  @ApiOperation({ summary: PRODUCTS.DOCS.GET.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: PRODUCTS.DOCS.GET.RESPONSE,
    type: ProductResponseDto,
  })
  @ApiDatabaseDocumentation()
  async findById(@Param("id") id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findById(id);
    return toProductDto(product);
  }

  @Post()
  @ApiOperation({ summary: PRODUCTS.DOCS.CREATE.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: PRODUCTS.DOCS.CREATE.RESPONSE,
    type: ProductResponseDto,
  })
  @ApiDatabaseDocumentation()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(dto);
    return toProductDto(product);
  }

  @Put(PRODUCTS.ROUTES.PARAMS.ID)
  @ApiOperation({ summary: PRODUCTS.DOCS.UPDATE.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: PRODUCTS.DOCS.UPDATE.RESPONSE,
    type: ProductResponseDto,
  })
  @ApiDatabaseDocumentation()
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, dto);
    return toProductDto(product);
  }

  @Delete(PRODUCTS.ROUTES.PARAMS.ID)
  @ApiOperation({ summary: PRODUCTS.DOCS.DELETE.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: PRODUCTS.DOCS.DELETE.RESPONSE,
  })
  @ApiDatabaseDocumentation()
  async remove(@Param("id") id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}
