<!--
  角色资源分配页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-card class="form-container" shadow="never">
    <div
      v-for="(cate, index) in allResourceCate"
      :key="'cate' + cate.id"
      :class="index === 0 ? 'top-line' : null"
    >
      <el-row class="table-layout" style="background: #f2f6fc">
        <el-checkbox
          v-model="cate.checked"
          :indeterminate="isIndeterminate(cate.id)"
          @change="handleCheckAllChange(cate)"
        >
          {{ cate.name }}
        </el-checkbox>
      </el-row>
      <el-row class="table-layout">
        <el-col
          v-for="resource in getResourceByCate(cate.id)"
          :key="resource.id"
          :span="8"
          style="padding: 4px 0"
        >
          <el-checkbox
            v-model="resource.checked"
            @change="handleCheckChange(resource)"
          >
            {{ resource.name }}
          </el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button @click="handleClear">清空</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ResourceService from '@/api/modules/resource';
import ResourceCategoryService from '@/api/modules/resourceCategory';
import RoleService from '@/api/modules/role';
import type { Resource, ResourceCategory } from '@/interface';

interface ResourceWithChecked extends Resource {
  checked: boolean;
}

interface ResourceCategoryWithChecked extends ResourceCategory {
  checked: boolean;
}

const route = useRoute();
const router = useRouter();

const roleId = ref<number>(0);
const allResource = ref<ResourceWithChecked[]>([]);
const allResourceCate = ref<ResourceCategoryWithChecked[]>([]);

// 获取所有资源列表
const getAllResourceList = async () => {
  try {
    const response = await ResourceService.fetchAllResourceList();
    allResource.value = response.data.map((item) => ({
      ...item,
      checked: false,
    }));
    await getResourceByRole(roleId.value);
  } catch (error) {
    console.error('获取资源列表失败:', error);
    ElMessage.error('获取资源列表失败');
  }
};

// 获取所有资源分类列表
const getAllResourceCateList = async () => {
  try {
    const response = await ResourceCategoryService.listAllCate();
    allResourceCate.value = response.data.map((item) => ({
      ...item,
      checked: false,
    }));
    await getAllResourceList();
  } catch (error) {
    console.error('获取资源分类列表失败:', error);
    ElMessage.error('获取资源分类列表失败');
  }
};

// 根据分类ID获取资源
const getResourceByCate = (categoryId: number) => {
  if (!allResource.value) return [];
  return allResource.value.filter(
    (resource) => resource.categoryId === categoryId,
  );
};

// 获取角色已分配的资源
const getResourceByRole = async (id: number) => {
  try {
    const response = await RoleService.listResourceByRole(id);
    const allocResource = response.data;

    allResource.value.forEach((item) => {
      item.checked = getResourceChecked(item.id, allocResource);
    });

    allResourceCate.value.forEach((item) => {
      item.checked = isAllChecked(item.id);
    });
  } catch (error) {
    console.error('获取角色资源失败:', error);
    ElMessage.error('获取角色资源失败');
  }
};

// 检查资源是否被选中
const getResourceChecked = (resourceId: number, allocResource: Resource[]) => {
  if (!allocResource || allocResource.length === 0) return false;
  return allocResource.some((item) => item.id === resourceId);
};

// 检查分类是否为不确定状态（部分选中）
const isIndeterminate = (categoryId: number) => {
  const cateResources = getResourceByCate(categoryId);
  if (!cateResources || cateResources.length === 0) return false;

  const checkedCount = cateResources.filter((item) => item.checked).length;
  return checkedCount > 0 && checkedCount < cateResources.length;
};

// 检查分类下的所有资源是否全部选中
const isAllChecked = (categoryId: number) => {
  const cateResources = getResourceByCate(categoryId);
  if (!cateResources || cateResources.length === 0) return false;

  const checkedCount = cateResources.filter((item) => item.checked).length;
  if (checkedCount === 0) return false;

  return checkedCount === cateResources.length;
};

// 保存资源分配
const handleSave = async () => {
  try {
    await ElMessageBox.confirm('是否分配资源?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const checkedResourceIds = new Set<number>();
    if (allResource.value && allResource.value.length > 0) {
      allResource.value.forEach((item) => {
        if (item.checked) {
          checkedResourceIds.add(item.id);
        }
      });
    }

    await RoleService.allocResource({
      roleId: roleId.value,
      resourceIds: Array.from(checkedResourceIds),
    });

    ElMessage.success('分配成功');
    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('分配失败:', error);
      ElMessage.error('分配失败');
    }
  }
};

// 清空选择
const handleClear = () => {
  allResourceCate.value.forEach((item) => {
    item.checked = false;
  });
  allResource.value.forEach((item) => {
    item.checked = false;
  });
};

// 全选/取消全选分类
const handleCheckAllChange = (cate: ResourceCategoryWithChecked) => {
  const cateResources = getResourceByCate(cate.id);
  cateResources.forEach((item) => {
    item.checked = cate.checked;
  });
};

// 单个资源选择变化
const handleCheckChange = (resource: ResourceWithChecked) => {
  allResourceCate.value.forEach((item) => {
    if (item.id === resource.categoryId) {
      item.checked = isAllChecked(resource.categoryId);
    }
  });
};

onMounted(() => {
  roleId.value = Number(route.query.roleId);
  getAllResourceCateList();
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
}

.table-layout {
  padding: 20px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
}

.top-line {
  border-top: 1px solid #dcdfe6;
}
</style>
